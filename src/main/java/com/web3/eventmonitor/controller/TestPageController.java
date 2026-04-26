package com.web3.eventmonitor.controller;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * Controller to serve the SSE test page.
 */
@Controller
public class TestPageController {

    @GetMapping(value = "/test-sse", produces = MediaType.TEXT_HTML_VALUE)
    @ResponseBody
    public String serveTestPage() throws IOException {
        Resource resource = new ClassPathResource("static/test-sse.html");
        return new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
    }
}
