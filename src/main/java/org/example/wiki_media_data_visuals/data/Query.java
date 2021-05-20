package org.example.wiki_media_data_visuals.data;

import java.util.Map;

public class Query {
    public Map<String, Page> getPages() {
        return pages;
    }

    public void setPages(Map<String, Page> pages) {
        this.pages = pages;
    }

    private Map<String,Page> pages;
}
