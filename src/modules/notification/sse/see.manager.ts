import { Response } from 'express';

interface SSEClient {
  userId: string;
  res: Response;
}

class SSEManager {
  private clients: Map<string, SSEClient[]> = new Map();

  addClient(userId: string, res: Response): void {
    const client: SSEClient = { userId, res };

    if (!this.clients.has(userId)) {
      this.clients.set(userId, []);
    }

    this.clients.get(userId)!.push(client);

    console.log(
      `📡 SSE 연결: ${userId} (현재 ${this.getClientCount()}명 접속)`
    );
  }

  removeClient(userId: string, res: Response): void {
    const userClients = this.clients.get(userId);

    if (!userClients) return;

    const filtered = userClients.filter((client) => client.res !== res);

    if (filtered.length === 0) {
      this.clients.delete(userId);
    } else {
      this.clients.set(userId, filtered);
    }

    console.log(
      `📡 SSE 해제: ${userId} (현재 ${this.getClientCount()}명 접속)`
    );
  }

  sendToUser(userId: string, data: object): void {
    const userClients = this.clients.get(userId);

    if (!userClients || userClients.length === 0) return;

    const message = `data: ${JSON.stringify(data)}\n\n`;

    for (const client of userClients) {
      client.res.write(message);
    }

    console.log(
      `📡 SSE 전송: ${userId} → ${JSON.stringify(data).substring(0, 50)}...`
    );
  }

  sendHeartBeat(): void {
    for (const [, userClients] of this.clients) {
      for (const client of userClients) {
        client.res.write(': heartbeat\n\n');
      }
    }
  }

  getClientCount(): number {
    let count = 0;
    for (const [, userClients] of this.clients) {
      count += userClients.length;
    }

    return count;
  }
}

export const sseManager = new SSEManager();

// 30초마다 heartbeat 전송 (연결 유지)
setInterval(() => {
  sseManager.sendHeartBeat();
}, 30000);
