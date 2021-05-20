package org.example.wiki_media_data_visuals.data;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;

import java.util.*;
import java.util.stream.Collectors;

public class Page {

    @JsonProperty("pageid")
    private int pageId;
    private int ns;
    private String title;
    private Map<String, Integer> pageviews;
    private Thumbnail thumbnail;
    private String fullurl;

    @JsonSetter("original")
    public void setOriginal(Thumbnail thumbnail) {
        this.thumbnail = thumbnail;
    }

    @JsonGetter("circle_size")
    public Integer getAvgPageViewsAsSizeOfSvg() {
        if (pageviews != null && !pageviews.isEmpty()) {
            List<Integer> nonNullPageviews = pageviews.values().stream()
                    .filter(Objects::nonNull)
                    .collect(Collectors.toCollection(ArrayList::new));
            Integer result = Collections.max(nonNullPageviews);
            return result > 150 ? 150 : Math.max(result, 80);
        }
        return 80;
    }

    public int getPageId() {
        return pageId;
    }

    public void setPageId(int pageId) {
        this.pageId = pageId;
    }

    public int getNs() {
        return ns;
    }

    public void setNs(int ns) {
        this.ns = ns;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Map<String, Integer> getPageviews() {
        return pageviews;
    }

    public void setPageviews(Map<String, Integer> pageviews) {
        this.pageviews = pageviews;
    }

    public String getFullurl() {
        return fullurl;
    }

    public void setFullurl(String fullurl) {
        this.fullurl = fullurl;
    }

    public Thumbnail getThumbnail() {
        return thumbnail;
    }

    public void setThumbnail(Thumbnail thumbnail) {
        this.thumbnail = thumbnail;
    }
}
