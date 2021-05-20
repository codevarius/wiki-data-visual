package org.example.wiki_media_data_visuals.controllers;

import org.example.wiki_media_data_visuals.data.WikiApiResponse;
import org.example.wiki_media_data_visuals.data.WikiChartDataDto;
import org.example.wiki_media_data_visuals.services.WikiDataManagerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/app")
public class MainController {

    private final WikiDataManagerService service;

    @Autowired
    public MainController(WikiDataManagerService service) {
        this.service = service;
    }

    @GetMapping("/pageviews")
    public String mainPage() {
        return "pageviews";
    }

    @PostMapping("/pageviews/add-page")
    public ResponseEntity<WikiChartDataDto> fetchDataForNewPerson(@RequestBody String pageTitle) {
        WikiChartDataDto wikiData = service.getWikiData(pageTitle);
        return ResponseEntity.ok(wikiData);
    }

    @GetMapping("/most-viewed-cloud")
    public String mostViewedCloud() {
        return "cloud";
    }

    @GetMapping("/most-viewed-cloud/data")
    public ResponseEntity<WikiApiResponse> mostViewedCloudData() {
        WikiApiResponse wikiData = service.getWikiData();
        return ResponseEntity.ok(wikiData);
    }

    @GetMapping("/categories-cloud")
    public String categoriesCloud() {
        return "categories";
    }

    @PostMapping("/categories-cloud/data")
    public ResponseEntity<WikiApiResponse> categoriesCloudData(@RequestBody String categoryTitle) {
        WikiApiResponse wikiData = service.getCategoriesData(categoryTitle);
        return ResponseEntity.ok(wikiData);
    }
}
