package org.example.wiki_media_data_visuals.services;

import org.example.wiki_media_data_visuals.data.WikiApiResponse;
import org.example.wiki_media_data_visuals.data.WikiChartDataDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class WikiDataManagerService {

    @Value("${wiki.api.req1}")
    private String pageViewsDataRequestUrl;

    @Value("${wiki.api.req2}")
    private String mostViewedDataRequestUrl;

    @Value("${wiki.api.req3}")
    private String categoriesDataRequestUrl;

    private final RestTemplate restTemplate;

    @Autowired
    public WikiDataManagerService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public WikiChartDataDto getWikiData(String pageTitle) {
        WikiApiResponse response = restTemplate.getForObject(pageViewsDataRequestUrl + pageTitle, WikiApiResponse.class);
        return new WikiChartDataDto(response != null ? response : new WikiApiResponse());
    }

    public WikiApiResponse getWikiData() {
        WikiApiResponse response = restTemplate.getForObject(mostViewedDataRequestUrl, WikiApiResponse.class);
        return response != null ? response : new WikiApiResponse();
    }

    public WikiApiResponse getCategoriesData(String categoryTitle) {
        WikiApiResponse response = restTemplate.getForObject(categoriesDataRequestUrl + categoryTitle, WikiApiResponse.class);
        return response != null ? response : new WikiApiResponse();
    }
}
