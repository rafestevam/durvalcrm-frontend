package br.com.durvalcrm.frontend;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletResponseWrapper;
import java.io.*;
import java.nio.charset.StandardCharsets;

public class ResponseModifierFilter implements Filter {
    
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
    }
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, 
                        FilterChain chain) throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        // Only intercept API calls
        if (httpRequest.getRequestURI().contains("/api/")) {
            // For GET requests, modify the response
            if ("GET".equalsIgnoreCase(httpRequest.getMethod())) {
                ResponseWrapper wrapper = new ResponseWrapper(httpResponse);
                chain.doFilter(request, wrapper);
                
                String content = wrapper.getCaptureAsString();
                
                // Replace localhost URLs with actual server URL
                if (content != null && content.length() > 0) {
                    // Replace Keycloak URLs
                    content = content.replace("https://localhost:443/realms", "https://20.127.155.169:9443/realms")
                                     .replace("https://localhost:443", "https://20.127.155.169:9443")
                                     .replace("https://localhost/realms", "https://20.127.155.169:9443/realms")
                                     .replace("https://localhost", "https://20.127.155.169:9443")
                                     .replace("http://localhost", "https://20.127.155.169:9443");
                    
                    System.out.println("ResponseModifierFilter: Modified response content for GET");
                }
                
                // Write the modified content
                if (content != null) {
                    response.setContentLength(content.getBytes(StandardCharsets.UTF_8).length);
                    response.getOutputStream().write(content.getBytes(StandardCharsets.UTF_8));
                }
            } else {
                // For POST/PUT/DELETE, just pass through
                chain.doFilter(request, response);
            }
        } else {
            chain.doFilter(request, response);
        }
    }
    
    @Override
    public void destroy() {
    }
    
    private static class ResponseWrapper extends HttpServletResponseWrapper {
        private ByteArrayOutputStream capture;
        private ServletOutputStream output;
        private PrintWriter writer;
        
        public ResponseWrapper(HttpServletResponse response) {
            super(response);
            capture = new ByteArrayOutputStream(response.getBufferSize());
        }
        
        @Override
        public ServletOutputStream getOutputStream() throws IOException {
            if (writer != null) {
                throw new IllegalStateException("getWriter() has already been called");
            }
            
            if (output == null) {
                output = new ServletOutputStream() {
                    @Override
                    public void write(int b) throws IOException {
                        capture.write(b);
                    }
                    
                    @Override
                    public void flush() throws IOException {
                        capture.flush();
                    }
                    
                    @Override
                    public void close() throws IOException {
                        capture.close();
                    }
                    
                    @Override
                    public boolean isReady() {
                        return true;
                    }
                    
                    @Override
                    public void setWriteListener(WriteListener listener) {
                    }
                };
            }
            return output;
        }
        
        @Override
        public PrintWriter getWriter() throws IOException {
            if (output != null) {
                throw new IllegalStateException("getOutputStream() has already been called");
            }
            
            if (writer == null) {
                writer = new PrintWriter(new OutputStreamWriter(capture, StandardCharsets.UTF_8));
            }
            return writer;
        }
        
        @Override
        public void flushBuffer() throws IOException {
            super.flushBuffer();
            if (writer != null) {
                writer.flush();
            } else if (output != null) {
                output.flush();
            }
        }
        
        public String getCaptureAsString() throws IOException {
            if (writer != null) {
                writer.flush();
            } else if (output != null) {
                output.flush();
            }
            return capture.toString(StandardCharsets.UTF_8.name());
        }
    }
}