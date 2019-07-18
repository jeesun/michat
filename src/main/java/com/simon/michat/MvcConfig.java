package com.simon.michat;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

/**
 * @author simon
 * @version 1.0
 * @date 2019-07-12 14:26
 */
@Configuration
public class MvcConfig extends WebMvcConfigurationSupport {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/home").setViewName("home");
        registry.addViewController("/").setViewName("home");
        registry.addViewController("/hello").setViewName("hello");
        registry.addViewController("/login").setViewName("login");
        registry.addViewController("/chatIndex").setViewName("chatIndex");
        registry.addViewController("/quill").setViewName("quill");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/static/**", "/webjars/**").addResourceLocations("classpath:/static/", "/webjars/");
        super.addResourceHandlers(registry);
    }
}