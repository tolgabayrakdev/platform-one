// SSE bağlantılarını yönetir
class NotificationManager {
  constructor() {
    // userId -> Set of Response objects
    this.connections = new Map();
  }

  /**
   * Kullanıcıya SSE bağlantısı ekle
   */
  addConnection(userId, res) {
    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set());
    }
    this.connections.get(userId).add(res);

    // Bağlantı kapandığında temizle
    res.on('close', () => {
      this.removeConnection(userId, res);
    });
  }

  /**
   * Kullanıcıdan SSE bağlantısını kaldır
   */
  removeConnection(userId, res) {
    if (this.connections.has(userId)) {
      this.connections.get(userId).delete(res);
      if (this.connections.get(userId).size === 0) {
        this.connections.delete(userId);
      }
    }
  }

  /**
   * Kullanıcıya bildirim gönder
   */
  sendNotification(userId, data) {
    if (this.connections.has(userId)) {
      const userConnections = this.connections.get(userId);
      const message = `data: ${JSON.stringify(data)}\n\n`;

      const toRemove = [];
      userConnections.forEach((res) => {
        try {
          if (!res.destroyed && res.writable) {
            res.write(message);
          } else {
            toRemove.push(res);
          }
        } catch (error) {
          // Bağlantı kapalıysa kaldır
          toRemove.push(res);
        }
      });

      // Kapalı bağlantıları temizle
      toRemove.forEach((res) => {
        this.removeConnection(userId, res);
      });
    }
  }

  /**
   * Tüm bağlantıları kapat
   */
  closeAll() {
    this.connections.forEach((userConnections, userId) => {
      userConnections.forEach((res) => {
        try {
          res.end();
        } catch (error) {
          // Hata yok say
        }
      });
    });
    this.connections.clear();
  }
}

// Singleton instance
const notificationManager = new NotificationManager();

export default notificationManager;
