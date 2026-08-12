import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import AddressService from "../api/AddressService";
import CartService from "../api/CartService";
import OrderService from "../api/OrderService";
import PaymentService from "../api/PaymentService";

import CheckoutSummary from "../components/CheckoutSummary";

import {
  showError,
  showInfo,
  showSuccess,
  showWarning,
} from "../utils/toastUtils";

const RAZORPAY_SCRIPT_URL =
  "https://checkout.razorpay.com/v1/checkout.js";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript =
      document.querySelector(
        `script[src="${RAZORPAY_SCRIPT_URL}"]`
      );

    if (existingScript) {
      existingScript.addEventListener(
        "load",
        () => resolve(true),
        {
          once: true,
        }
      );

      existingScript.addEventListener(
        "error",
        () => resolve(false),
        {
          once: true,
        }
      );

      return;
    }

    const script =
      document.createElement("script");

    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] =
    useState([]);

  const [addresses, setAddresses] =
    useState([]);

  const [
    selectedAddressId,
    setSelectedAddressId,
  ] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [placing, setPlacing] =
    useState(false);

  const navigate = useNavigate();

  const storedUser = useMemo(() => {
    const userValue =
      localStorage.getItem("user");

    if (!userValue) {
      return null;
    }

    try {
      return JSON.parse(userValue);
    } catch {
      return null;
    }
  }, []);

  const loadCheckoutData =
    useCallback(async () => {
      try {
        setLoading(true);

        const [
          cartResponse,
          addressResponse,
        ] = await Promise.all([
          CartService.getCart(),
          AddressService.getAll(),
        ]);

        const loadedCartItems =
          Array.isArray(cartResponse.data)
            ? cartResponse.data
            : [];

        const loadedAddresses =
          Array.isArray(
            addressResponse.data
          )
            ? addressResponse.data
            : [];

        setCartItems(loadedCartItems);
        setAddresses(loadedAddresses);

        const defaultAddress =
          loadedAddresses.find(
            (address) =>
              address.defaultAddress
          );

        if (defaultAddress) {
          setSelectedAddressId(
            String(defaultAddress.id)
          );
        } else if (
          loadedAddresses.length > 0
        ) {
          setSelectedAddressId(
            String(
              loadedAddresses[0].id
            )
          );
        }
      } catch (error) {
        setCartItems([]);
        setAddresses([]);

        showError(
          error,
          "Unable to load checkout details"
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadCheckoutData();
  }, [loadCheckoutData]);

  const hasUnavailableProducts =
    useMemo(
      () =>
        cartItems.some((item) => {
          const productInactive =
            item.productActive === false;

          const stockKnown =
            item.availableStock !==
              null &&
            item.availableStock !==
              undefined;

          const insufficientStock =
            stockKnown &&
            Number(
              item.availableStock
            ) <
              Number(
                item.quantity || 0
              );

          return (
            productInactive ||
            insufficientStock
          );
        }),
      [cartItems]
    );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    navigate("/login", {
      replace: true,
    });
  };

  const verifyRazorpayPayment = async ({
    applicationOrderId,
    razorpayResponse,
  }) => {
    await PaymentService.verifyPayment({
      applicationOrderId,
      razorpayOrderId:
        razorpayResponse
          .razorpay_order_id,
      razorpayPaymentId:
        razorpayResponse
          .razorpay_payment_id,
      razorpaySignature:
        razorpayResponse
          .razorpay_signature,
    });
  };

  const openRazorpayCheckout = async (
    applicationOrder
  ) => {
    const scriptLoaded =
      await loadRazorpayScript();

    if (!scriptLoaded) {
      throw new Error(
        "Unable to load Razorpay Checkout"
      );
    }

    const applicationOrderId =
      applicationOrder.id ??
      applicationOrder.orderId;

    if (!applicationOrderId) {
      throw new Error(
        "Application order ID is missing"
      );
    }

    const paymentResponse =
      await PaymentService.createPaymentOrder(
        applicationOrderId
      );

    const paymentOrder =
      paymentResponse.data;

    const razorpayOrderId =
      paymentOrder.razorpayOrderId ??
      paymentOrder.orderId;

    if (!razorpayOrderId) {
      throw new Error(
        "Razorpay order ID is missing"
      );
    }

    const razorpayKey =
      paymentOrder.keyId ||
      import.meta.env
        .VITE_RAZORPAY_KEY_ID;

    if (!razorpayKey) {
      throw new Error(
        "Razorpay key is not configured"
      );
    }

    const options = {
      key: razorpayKey,
      amount: paymentOrder.amount,
      currency:
        paymentOrder.currency || "INR",
      name: "The Cutie Collection",
      description: `Payment for ${
        applicationOrder.orderNumber ||
        `order ${applicationOrderId}`
      }`,
      order_id: razorpayOrderId,

      prefill: {
        name: storedUser?.name || "",
        email: storedUser?.email || "",
      },

      theme: {
        color: "#e91e8c",
      },

      handler: async (
        razorpayResponse
      ) => {
        try {
          await verifyRazorpayPayment({
            applicationOrderId,
            razorpayResponse,
          });

          showSuccess(
            "Payment verified successfully"
          );

          navigate("/orders", {
            replace: true,
          });
        } catch (error) {
          showError(
            error,
            "Payment verification failed"
          );
        } finally {
          setPlacing(false);
        }
      },

      modal: {
        ondismiss: () => {
          setPlacing(false);

          showInfo(
            "Payment window closed. Your order remains available in My Orders."
          );
        },
      },
    };

    const razorpay =
      new window.Razorpay(options);

    razorpay.on(
      "payment.failed",
      (response) => {
        setPlacing(false);

        const message =
          response.error?.description ||
          "Payment failed";

        showError(message);
      }
    );

    razorpay.open();
  };

  const handlePlaceOrder = async () => {
    if (placing) {
      return;
    }

    if (cartItems.length === 0) {
      showWarning(
        "Your cart is empty"
      );
      return;
    }

    if (hasUnavailableProducts) {
      showWarning(
        "Update unavailable or understocked products before checkout"
      );
      return;
    }

    if (!selectedAddressId) {
      showWarning(
        "Select a shipping address"
      );
      return;
    }

    try {
      setPlacing(true);

      /*
       * Step 1:
       * Create the application order using
       * the authenticated customer, cart,
       * and selected address.
       */
      const orderResponse =
        await OrderService.placeOrder(
          Number(selectedAddressId)
        );

      const applicationOrder =
        orderResponse.data;

      showSuccess(
        "Order created successfully"
      );

      /*
       * Step 2:
       * Create the Razorpay order using the
       * saved application order ID.
       *
       * The backend calculates the payment
       * amount. React does not send an amount.
       */
      await openRazorpayCheckout(
        applicationOrder
      );
    } catch (error) {
      setPlacing(false);

      showError(
        error,
        "Unable to place the order"
      );
    }
  };

  return (
    <div style={styles.page}>
      {/* Navigation */}
      <nav style={styles.navbar}>
        <Link
          to="/"
          style={styles.brandLink}
        >
          <div style={styles.navBrand}>
            <span
              style={styles.navLogo}
              aria-hidden="true"
            >
              🌸
            </span>

            <span style={styles.navTitle}>
              Cutie Collection
            </span>
          </div>
        </Link>

        <div style={styles.navLinks}>
          <Link
            to="/"
            style={styles.navLink}
          >
            Home
          </Link>

          <Link
            to="/products"
            style={styles.navLink}
          >
            Products
          </Link>

          <Link
            to="/cart"
            style={styles.navLink}
          >
            🛒 Cart
          </Link>

          <Link
            to="/orders"
            style={styles.navLink}
          >
            📦 Orders
          </Link>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          style={styles.logoutButton}
        >
          🌸 Logout
        </button>
      </nav>

      {/* Header */}
      <header style={styles.header}>
        <div
          style={styles.blobOne}
          aria-hidden="true"
        />

        <div
          style={styles.blobTwo}
          aria-hidden="true"
        />

        <div style={styles.headerContent}>
          <span style={styles.headerBadge}>
            🔒 Secure Checkout
          </span>

          <h1 style={styles.title}>
            Almost{" "}
            <span style={styles.accent}>
              There! 🎀
            </span>
          </h1>

          <p style={styles.subtitle}>
            Select your shipping address,
            review the order, and complete
            payment securely.
          </p>
        </div>
      </header>

      <main style={styles.container}>
        {loading ? (
          <div
            style={styles.loadingBox}
            role="status"
          >
            <span
              style={styles.loadingIcon}
              aria-hidden="true"
            >
              🌸
            </span>

            <p style={styles.loadingText}>
              Loading checkout details...
            </p>
          </div>
        ) : cartItems.length === 0 ? (
          <div style={styles.emptyBox}>
            <span
              style={styles.emptyIcon}
              aria-hidden="true"
            >
              🛒
            </span>

            <p style={styles.emptyTitle}>
              Nothing to checkout
            </p>

            <p style={styles.emptyText}>
              Add products to your cart
              before continuing.
            </p>

            <button
              type="button"
              style={styles.shopButton}
              onClick={() =>
                navigate("/products")
              }
            >
              Shop Now 🌸
            </button>
          </div>
        ) : (
          <div style={styles.layout}>
            <div style={styles.leftColumn}>
              {/* Shipping address */}
              <section style={styles.infoCard}>
                <div
                  style={
                    styles.sectionHeader
                  }
                >
                  <div>
                    <h2
                      style={
                        styles.sectionTitle
                      }
                    >
                      📍 Shipping Address
                    </h2>

                    <p
                      style={
                        styles.sectionSubtitle
                      }
                    >
                      Select where this order
                      should be delivered.
                    </p>
                  </div>
                </div>

                {addresses.length === 0 ? (
                  <div style={styles.noticeBox}>
                    <p style={styles.noticeText}>
                      No saved address is
                      available.
                    </p>

                    <p
                      style={
                        styles.noticeSubtext
                      }
                    >
                      Add an address before
                      placing the order.
                    </p>
                  </div>
                ) : (
                  <div
                    style={
                      styles.addressList
                    }
                  >
                    {addresses.map(
                      (address) => {
                        const selected =
                          String(
                            address.id
                          ) ===
                          String(
                            selectedAddressId
                          );

                        return (
                          <label
                            key={address.id}
                            style={{
                              ...styles.addressCard,
                              ...(selected
                                ? styles.selectedAddressCard
                                : {}),
                            }}
                          >
                            <input
                              type="radio"
                              name="shippingAddress"
                              value={address.id}
                              checked={selected}
                              onChange={(
                                event
                              ) =>
                                setSelectedAddressId(
                                  event
                                    .target
                                    .value
                                )
                              }
                              disabled={placing}
                              style={
                                styles.addressRadio
                              }
                            />

                            <div
                              style={
                                styles.addressContent
                              }
                            >
                              <div
                                style={
                                  styles.addressTitleRow
                                }
                              >
                                <strong
                                  style={
                                    styles.addressName
                                  }
                                >
                                  {
                                    address.fullName
                                  }
                                </strong>

                                {address.defaultAddress && (
                                  <span
                                    style={
                                      styles.defaultBadge
                                    }
                                  >
                                    Default
                                  </span>
                                )}
                              </div>

                              <span
                                style={
                                  styles.addressText
                                }
                              >
                                {
                                  address.addressLine1
                                }
                                {address.addressLine2
                                  ? `, ${address.addressLine2}`
                                  : ""}
                              </span>

                              <span
                                style={
                                  styles.addressText
                                }
                              >
                                {address.city},{" "}
                                {address.state}{" "}
                                {
                                  address.postalCode
                                }
                              </span>

                              <span
                                style={
                                  styles.addressText
                                }
                              >
                                {
                                  address.country
                                }
                              </span>

                              <span
                                style={
                                  styles.addressPhone
                                }
                              >
                                📞{" "}
                                {
                                  address.phoneNumber
                                }
                              </span>
                            </div>
                          </label>
                        );
                      }
                    )}
                  </div>
                )}
              </section>

              {/* Payment method */}
              <section style={styles.infoCard}>
                <h2
                  style={styles.sectionTitle}
                >
                  💳 Payment Method
                </h2>

                <div
                  style={
                    styles.paymentOption
                  }
                >
                  <span
                    style={
                      styles.paymentDot
                    }
                    aria-hidden="true"
                  />

                  <div
                    style={
                      styles.paymentContent
                    }
                  >
                    <span
                      style={
                        styles.paymentLabel
                      }
                    >
                      Razorpay Online Payment
                    </span>

                    <span
                      style={
                        styles.paymentDescription
                      }
                    >
                      Complete payment using
                      the payment methods
                      available through Razorpay.
                    </span>
                  </div>

                  <span
                    style={
                      styles.selectedBadge
                    }
                  >
                    Selected
                  </span>
                </div>

                <p
                  style={
                    styles.paymentSecurityText
                  }
                >
                  The backend retrieves the
                  final amount from the saved
                  order and verifies the
                  Razorpay signature.
                </p>
              </section>
            </div>

            {/* Order summary */}
            <div style={styles.rightColumn}>
              <CheckoutSummary
                cartItems={cartItems}
                onPlaceOrder={
                  handlePlaceOrder
                }
                placing={placing}
                canPlaceOrder={Boolean(
                  selectedAddressId
                )}
              />
            </div>
          </div>
        )}
      </main>

      <footer style={styles.footer}>
        <p>
          © {new Date().getFullYear()} Cutie
          Collection. Made with 💕 for all
          cuties.
        </p>
      </footer>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#ffffff",
    color: "#333333",
    fontFamily: "'Poppins', sans-serif",
  },

  navbar: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    padding: "16px 5%",
    borderBottom: "1.5px solid #fce4ec",
    background: "rgba(255,255,255,0.96)",
    backdropFilter: "blur(10px)",
    flexWrap: "wrap",
  },

  brandLink: {
    textDecoration: "none",
  },

  navBrand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  navLogo: {
    fontSize: "28px",
  },

  navTitle: {
    color: "#e91e8c",
    fontSize: "20px",
    fontWeight: "700",
  },

  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
    flexWrap: "wrap",
  },

  navLink: {
    color: "#a81750",
    fontSize: "13px",
    fontWeight: "500",
    textDecoration: "none",
  },

  logoutButton: {
    padding: "8px 18px",
    border: "none",
    borderRadius: "20px",
    background:
      "linear-gradient(135deg, #f06292, #e91e8c)",
    color: "#ffffff",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "13px",
    fontWeight: "600",
  },

  header: {
    position: "relative",
    padding: "60px 5% 50px",
    overflow: "hidden",
    background:
      "linear-gradient(135deg, #fff0f5 0%, #fce4ec 100%)",
  },

  blobOne: {
    position: "absolute",
    top: "-80px",
    right: "-60px",
    width: "280px",
    height: "280px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, #f8bbd0, #f48fb1)",
    opacity: 0.25,
    filter: "blur(50px)",
  },

  blobTwo: {
    position: "absolute",
    bottom: "-60px",
    left: "-60px",
    width: "240px",
    height: "240px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, #fce4ec, #f8bbd0)",
    opacity: 0.3,
    filter: "blur(40px)",
  },

  headerContent: {
    position: "relative",
    zIndex: 1,
  },

  headerBadge: {
    display: "inline-block",
    marginBottom: "16px",
    padding: "6px 16px",
    border: "1.5px solid #f8bbd0",
    borderRadius: "20px",
    background: "#ffffff",
    color: "#e91e8c",
    fontSize: "13px",
    fontWeight: "600",
  },

  title: {
    margin: "0 0 10px",
    color: "#2d2d2d",
    fontSize: "clamp(32px, 6vw, 40px)",
    fontWeight: "800",
  },

  accent: {
    color: "#e91e8c",
  },

  subtitle: {
    margin: 0,
    color: "#777777",
    fontSize: "15px",
  },

  container: {
    width: "min(1200px, calc(100% - 32px))",
    margin: "0 auto",
    padding: "40px 0",
  },

  layout: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1fr) minmax(300px, 370px)",
    gap: "32px",
    alignItems: "flex-start",
  },

  leftColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    minWidth: 0,
  },

  rightColumn: {
    minWidth: 0,
  },

  infoCard: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    padding: "28px",
    border: "1.5px solid #f8bbd0",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.95)",
    boxShadow:
      "0 8px 32px rgba(244,143,177,0.12)",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
  },

  sectionTitle: {
    margin: 0,
    color: "#333333",
    fontSize: "18px",
    fontWeight: "700",
  },

  sectionSubtitle: {
    margin: "5px 0 0",
    color: "#777777",
    fontSize: "12px",
  },

  addressList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  addressCard: {
    display: "flex",
    gap: "12px",
    padding: "16px",
    border: "1.5px solid #f8bbd0",
    borderRadius: "15px",
    background: "#fffafd",
    cursor: "pointer",
  },

  selectedAddressCard: {
    borderColor: "#e91e8c",
    background: "#fff0f5",
    boxShadow:
      "0 0 0 3px rgba(233,30,140,0.08)",
  },

  addressRadio: {
    marginTop: "4px",
    accentColor: "#e91e8c",
  },

  addressContent: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    gap: "3px",
  },

  addressTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },

  addressName: {
    color: "#333333",
    fontSize: "13px",
  },

  defaultBadge: {
    padding: "2px 8px",
    borderRadius: "999px",
    background: "#e8f5e9",
    color: "#2e7d32",
    fontSize: "9px",
    fontWeight: "700",
  },

  addressText: {
    color: "#666666",
    fontSize: "11px",
    lineHeight: 1.5,
  },

  addressPhone: {
    marginTop: "3px",
    color: "#a81750",
    fontSize: "11px",
    fontWeight: "600",
  },

  noticeBox: {
    padding: "18px",
    border: "1.5px dashed #f8bbd0",
    borderRadius: "14px",
    background: "#fffafd",
    textAlign: "center",
  },

  noticeText: {
    margin: "0 0 4px",
    color: "#a81750",
    fontSize: "13px",
    fontWeight: "700",
  },

  noticeSubtext: {
    margin: 0,
    color: "#777777",
    fontSize: "11px",
  },

  paymentOption: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "15px",
    border: "1.5px solid #f8bbd0",
    borderRadius: "14px",
    background: "#fffafd",
  },

  paymentDot: {
    width: "14px",
    height: "14px",
    flexShrink: 0,
    borderRadius: "50%",
    background:
      "linear-gradient(135deg, #f06292, #e91e8c)",
  },

  paymentContent: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    gap: "3px",
  },

  paymentLabel: {
    color: "#333333",
    fontSize: "13px",
    fontWeight: "700",
  },

  paymentDescription: {
    color: "#777777",
    fontSize: "10px",
    lineHeight: 1.5,
  },

  selectedBadge: {
    padding: "3px 10px",
    border: "1px solid #c8e6c9",
    borderRadius: "20px",
    background: "#e8f5e9",
    color: "#2e7d32",
    fontSize: "10px",
    fontWeight: "600",
  },

  paymentSecurityText: {
    margin: 0,
    color: "#777777",
    fontSize: "10px",
    lineHeight: 1.6,
  },

  loadingBox: {
    padding: "80px 20px",
    textAlign: "center",
  },

  loadingIcon: {
    display: "block",
    fontSize: "48px",
  },

  loadingText: {
    marginTop: "16px",
    color: "#c85f89",
    fontSize: "16px",
  },

  emptyBox: {
    padding: "60px 20px",
    border: "1.5px solid #f8bbd0",
    borderRadius: "24px",
    background:
      "linear-gradient(135deg, #fff0f5, #fce4ec)",
    textAlign: "center",
  },

  emptyIcon: {
    display: "block",
    fontSize: "64px",
  },

  emptyTitle: {
    margin: "16px 0 6px",
    color: "#e91e8c",
    fontSize: "20px",
    fontWeight: "700",
  },

  emptyText: {
    margin: "0 0 24px",
    color: "#9f5575",
    fontSize: "14px",
  },

  shopButton: {
    padding: "13px 28px",
    border: "none",
    borderRadius: "14px",
    background:
      "linear-gradient(135deg, #f06292, #e91e8c)",
    color: "#ffffff",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "14px",
    fontWeight: "600",
  },

  footer: {
    marginTop: "60px",
    padding: "24px",
    background: "#2d2d2d",
    color: "#999999",
    fontSize: "13px",
    textAlign: "center",
  },
};