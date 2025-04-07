package com.example.springstockserver.model;

public class StockData {
    private String symbol;
    private double price;
    private double change;
    private long volume;

    public StockData() {
    }

    public StockData(String symbol, double price, double change, long volume) {
        this.symbol = symbol;
        this.price = price;
        this.change = change;
        this.volume = volume;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public double getChange() {
        return change;
    }

    public void setChange(double change) {
        this.change = change;
    }

    public long getVolume() {
        return volume;
    }

    public void setVolume(long volume) {
        this.volume = volume;
    }
}
