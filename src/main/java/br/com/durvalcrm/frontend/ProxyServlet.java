package br.com.durvalcrm.frontend;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.io.ByteArrayOutputStream;
import java.util.Enumeration;
import java.util.List;
import java.util.Map;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import java.security.cert.X509Certificate;
import java.lang.reflect.Field;

public class ProxyServlet extends HttpServlet {
    
    private static final String BACKEND_URL = System.getenv("BACKEND_URL") != null ? 
        System.getenv("BACKEND_URL") : "https://20.127.155.169:8443/durvalcrm/api";
    
    static {
        // Disable SSL certificate validation for self-signed certificates
        try {
            TrustManager[] trustAllCerts = new TrustManager[]{
                new X509TrustManager() {
                    public X509Certificate[] getAcceptedIssuers() { return null; }
                    public void checkClientTrusted(X509Certificate[] certs, String authType) { }
                    public void checkServerTrusted(X509Certificate[] certs, String authType) { }
                }
            };
            
            SSLContext sc = SSLContext.getInstance("SSL");
            sc.init(null, trustAllCerts, new java.security.SecureRandom());
            HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
            HttpsURLConnection.setDefaultHostnameVerifier((hostname, session) -> true);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        try {
            String method = request.getMethod();
            String pathInfo = request.getPathInfo();
            String queryString = request.getQueryString();
            
            // Log para debug
            System.out.println("ProxyServlet: " + method + " " + request.getRequestURI());
            System.out.println("PathInfo: " + pathInfo);
            System.out.println("Content-Type: " + request.getContentType());
            
            String targetUrl = BACKEND_URL + (pathInfo != null ? pathInfo : "");
            if (queryString != null) {
                targetUrl += "?" + queryString;
            }
            
            System.out.println("Proxying to: " + targetUrl);
        
        URL url = new URL(targetUrl);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        
        // Enable PATCH method support using reflection
        if ("PATCH".equalsIgnoreCase(method)) {
            try {
                // Use reflection to allow PATCH method
                Field methodField = HttpURLConnection.class.getDeclaredField("method");
                methodField.setAccessible(true);
                methodField.set(connection, "PATCH");
                System.out.println("Successfully set PATCH method using reflection");
            } catch (Exception e) {
                System.out.println("Reflection failed, using POST fallback: " + e.getMessage());
                connection.setRequestMethod("POST");
                // Not using X-HTTP-Method-Override since backend doesn't support it
            }
        } else {
            connection.setRequestMethod(method);
        }
        connection.setDoOutput(true);
        connection.setDoInput(true);
        
        Enumeration<String> headers = request.getHeaderNames();
        while (headers.hasMoreElements()) {
            String header = headers.nextElement();
            if (!header.equalsIgnoreCase("Host") && 
                !header.equalsIgnoreCase("Connection") &&
                !header.equalsIgnoreCase("Content-Length")) {
                connection.setRequestProperty(header, request.getHeader(header));
            }
        }
        
        if ("POST".equalsIgnoreCase(method) || "PUT".equalsIgnoreCase(method) || 
            "PATCH".equalsIgnoreCase(method)) {
            connection.setDoOutput(true);
            
            // Read request body
            ByteArrayOutputStream bodyBuffer = new ByteArrayOutputStream();
            try (InputStream in = request.getInputStream()) {
                byte[] buffer = new byte[8192];
                int bytesRead;
                while ((bytesRead = in.read(buffer)) != -1) {
                    bodyBuffer.write(buffer, 0, bytesRead);
                }
            }
            
            byte[] bodyBytes = bodyBuffer.toByteArray();
            String bodyContent = new String(bodyBytes, "UTF-8");
            System.out.println("Request body: " + bodyContent);
            
            // Write to connection
            if (bodyBytes.length > 0) {
                connection.setRequestProperty("Content-Length", String.valueOf(bodyBytes.length));
                try (OutputStream out = connection.getOutputStream()) {
                    out.write(bodyBytes);
                }
            }
        }
        
        int responseCode = connection.getResponseCode();
        System.out.println("Response code from backend: " + responseCode);
        response.setStatus(responseCode);
        
        Map<String, List<String>> responseHeaders = connection.getHeaderFields();
        for (Map.Entry<String, List<String>> entry : responseHeaders.entrySet()) {
            String headerName = entry.getKey();
            if (headerName != null && !headerName.equalsIgnoreCase("Transfer-Encoding")) {
                for (String headerValue : entry.getValue()) {
                    response.addHeader(headerName, headerValue);
                }
            }
        }
        
        // Read response body
        ByteArrayOutputStream responseBuffer = new ByteArrayOutputStream();
        try (InputStream in = (responseCode >= 200 && responseCode < 400) ? 
                connection.getInputStream() : connection.getErrorStream()) {
            if (in != null) {
                byte[] buffer = new byte[8192];
                int bytesRead;
                while ((bytesRead = in.read(buffer)) != -1) {
                    responseBuffer.write(buffer, 0, bytesRead);
                }
            }
        }
        
        byte[] responseBytes = responseBuffer.toByteArray();
        if (responseCode >= 500) {
            String errorContent = new String(responseBytes, "UTF-8");
            System.out.println("Error response from backend: " + errorContent);
        }
        
        // Write response to client
        try (OutputStream out = response.getOutputStream()) {
            out.write(responseBytes);
        }
        
            connection.disconnect();
        } catch (Exception e) {
            System.err.println("Error in ProxyServlet: " + e.getMessage());
            e.printStackTrace();
            response.setStatus(500);
            response.getWriter().write("Proxy error: " + e.getMessage());
        }
    }
}