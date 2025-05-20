package com.sismics.docs.rest.resource;

import com.google.common.base.Strings;
import com.sismics.rest.exception.ClientException;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * User application REST resources.
 * 
 * @author yang
 */
@jakarta.ws.rs.Path("/userapplication")
public class UserApplicationResource extends BaseResource {
    private static final String APPLICATION_FILE = "data/user_applications.txt";

    /**
     * Submit a new user application.
     *
     * @param username Username
     * @param email Email
     * @param password Password
     * @return Response
     */
    @PUT
    @Produces(MediaType.APPLICATION_JSON)
    public Response submit(
            @FormParam("username") String username,
            @FormParam("email") String email,
            @FormParam("password") String password) {
        
        // Validate input
        if (Strings.isNullOrEmpty(username) || Strings.isNullOrEmpty(email) || Strings.isNullOrEmpty(password)) {
            throw new ClientException("ValidationError", "Invalid input");
        }

        // Read existing applications
        List<String> applications = new ArrayList<>();
        try {
            if (java.nio.file.Files.exists(java.nio.file.Paths.get(APPLICATION_FILE))) {
                applications = java.nio.file.Files.readAllLines(java.nio.file.Paths.get(APPLICATION_FILE), StandardCharsets.UTF_8);
            }
        } catch (IOException e) {
            // Ignore if file doesn't exist
        }

        // Check for duplicate username
        for (String line : applications) {
            String[] parts = line.split(",");
            if (parts.length > 0 && username.equals(parts[0])) {
                throw new ClientException("DuplicateUsername", "Username already exists in applications");
            }
        }

        // Add new application
        String newApplication = String.format("%s,%s,%s,%s", 
            username, email, password, new Date().toInstant().toString());
        applications.add(newApplication);

        // Save to file
        try {
            java.nio.file.Files.createDirectories(java.nio.file.Paths.get("data"));
            java.nio.file.Files.write(java.nio.file.Paths.get(APPLICATION_FILE), applications, StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new ClientException("IOError", "Failed to save application");
        }

        return Response.ok().build();
    }

    /**
     * Returns all user applications.
     * 
     * @return Response
     */
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response list() {
        List<String> applications = new ArrayList<>();
        try {
            if (java.nio.file.Files.exists(java.nio.file.Paths.get(APPLICATION_FILE))) {
                applications = java.nio.file.Files.readAllLines(java.nio.file.Paths.get(APPLICATION_FILE), StandardCharsets.UTF_8);
            }
        } catch (IOException e) {
            // Return empty list if file doesn't exist
        }
        
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < applications.size(); i++) {
            String[] parts = applications.get(i).split(",");
            if (parts.length >= 4) {
                if (i > 0) sb.append(",");
                sb.append("{\"username\":\"").append(parts[0])
                  .append("\",\"email\":\"").append(parts[1])
                  .append("\",\"password\":\"").append(parts[2])
                  .append("\",\"date\":\"").append(parts[3])
                  .append("\"}");
            }
        }
        sb.append("]");
        
        return Response.ok().entity(sb.toString()).build();
    }

    /**
     * Delete a user application.
     * 
     * @param username Username to delete
     * @return Response
     */
    @DELETE
    @jakarta.ws.rs.Path("{username: [a-zA-Z0-9_@.-]+}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response delete(@PathParam("username") String username) {
        List<String> applications = new ArrayList<>();
        List<String> newApplications = new ArrayList<>();
        
        try {
            if (java.nio.file.Files.exists(java.nio.file.Paths.get(APPLICATION_FILE))) {
                applications = java.nio.file.Files.readAllLines(java.nio.file.Paths.get(APPLICATION_FILE), StandardCharsets.UTF_8);
            }
        } catch (IOException e) {
            return Response.ok().build();
        }

        // Remove the application
        for (String line : applications) {
            String[] parts = line.split(",");
            if (parts.length > 0 && !username.equals(parts[0])) {
                newApplications.add(line);
            }
        }

        // Save to file
        try {
            java.nio.file.Files.write(java.nio.file.Paths.get(APPLICATION_FILE), newApplications, StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new ClientException("IOError", "Failed to save applications");
        }

        return Response.ok().build();
    }
} 