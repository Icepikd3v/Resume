import java.util.Map;

public class InventoryService {
    private final Map<String, Integer> stock;

    public InventoryService(Map<String, Integer> stock) {
        this.stock = stock;
    }

    public boolean reserve(String sku, int quantity) {
        int available = stock.getOrDefault(sku, 0);
        if (quantity <= 0 || available < quantity) {
            return false;
        }

        stock.put(sku, available - quantity);
        return true;
    }
}
