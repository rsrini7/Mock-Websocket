package com.example.springstockserver.handler;

import com.example.springstockserver.model.StockData;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.*;

public class StockWebSocketHandler extends TextWebSocketHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(4);
    private final ConcurrentMap<String, WebSocketSession> activeSessions = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, ScheduledFuture<?>> sessionTasks = new ConcurrentHashMap<>();
    private final List<String> symbols = Arrays.asList("AAPL", "GOOGL", "MSFT", "AMZN", "FB", "TSLA", "NFLX", "NVDA");
    private final Random random = new Random();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        System.out.println("Client connected: " + session.getId());
        activeSessions.put(session.getId(), session);

        Runnable sendStockDataTask = () -> {
            try {
                if (session.isOpen()) {
                    List<StockData> stockDataList = generateStockData();
                    String json = objectMapper.writeValueAsString(stockDataList);
                    synchronized (session) {
                        session.sendMessage(new TextMessage(json));
                    }
                } else {
                    stopSessionTask(session);
                }
            } catch (IOException e) {
                System.err.println("Error sending message to client " + session.getId() + ": " + e.getMessage());
                stopSessionTask(session);
            }
        };

        // Send initial data immediately
        sendStockDataTask.run();

        // Schedule periodic updates
        ScheduledFuture<?> future = scheduler.scheduleAtFixedRate(sendStockDataTask, 1, 1, TimeUnit.SECONDS);
        sessionTasks.put(session.getId(), future);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        System.err.println("Transport error for session " + session.getId() + ": " + exception.getMessage());
        stopSessionTask(session);
        closeSessionQuietly(session);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        System.out.println("Client disconnected: " + session.getId() + " with status: " + status);
        stopSessionTask(session);
        activeSessions.remove(session.getId());
    }

    private void stopSessionTask(WebSocketSession session) {
        ScheduledFuture<?> future = sessionTasks.remove(session.getId());
        if (future != null) {
            future.cancel(true);
        }
    }

    private void closeSessionQuietly(WebSocketSession session) {
        try {
            if (session.isOpen()) {
                session.close();
            }
        } catch (IOException e) {
            System.err.println("Error closing session: " + e.getMessage());
        }
    }

    private List<StockData> generateStockData() {
        return symbols.stream()
                .map(symbol -> new StockData(
                        symbol,
                        round(random.nextDouble() * 1000, 2),
                        round(random.nextDouble() * 10 - 5, 2),
                        random.nextInt(1_000_000)
                ))
                .toList();
    }

    private double round(double value, int places) {
        double scale = Math.pow(10, places);
        return Math.round(value * scale) / scale;
    }
}
