package org.example.wiki_media_data_visuals.data;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class WikiChartDataDto {

    private String pageId;
    private List<LocalDate> dates;
    private List<Integer> viewCounts;
    private Thumbnail thumbnail;
    private String fullurl;

    public WikiChartDataDto(WikiApiResponse wikiResponse) {
        for (Map.Entry<String, Page> set : wikiResponse.getQuery().getPages().entrySet()) {
            Map<String, Integer> map = set.getValue().getPageviews();
            if (map != null) {
                this.dates = set.getValue().getPageviews().keySet().stream().map(LocalDate::parse).collect(Collectors.toList());
                this.viewCounts = new ArrayList<>(set.getValue().getPageviews().values());
            }
            this.pageId = String.valueOf(set.getValue().getPageId());
            this.fullurl = set.getValue().getFullurl();
            this.thumbnail = set.getValue().getThumbnail();
        }
    }

    public List<LocalDate> getDates() {
        return dates;
    }

    public void setDates(List<LocalDate> dates) {
        this.dates = dates;
    }

    public List<Integer> getViewCounts() {
        return viewCounts;
    }

    public void setViewCounts(List<Integer> viewCounts) {
        this.viewCounts = viewCounts;
    }

    public String getPageId() {
        return pageId;
    }

    public void setPageId(String pageId) {
        this.pageId = pageId;
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
