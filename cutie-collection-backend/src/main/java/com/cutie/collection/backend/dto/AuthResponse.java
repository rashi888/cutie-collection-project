package com.cutie.collection.backend.dto;

public class AuthResponse {

    private String token;
    private String name;
    private String message;
    private String role;

  

    public AuthResponse() {
		super();
		// TODO Auto-generated constructor stub
	}

	public AuthResponse(String token, String name, String message, String role) {
		super();
		this.token = token;
		this.name = name;
		this.message = message;
		this.role = role;
	}

	public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

	public String getRole() {
		return role;
	}

	public void setRole(String role) {
		this.role = role;
	}
    
}