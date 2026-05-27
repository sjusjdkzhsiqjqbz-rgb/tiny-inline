interface LruNode {
  key: string;
  value: string;
  prev: LruNode | null;
  next: LruNode | null;
}

export class LruCache {
  private capacity: number;
  private map = new Map<string, LruNode>();
  private head: LruNode | null = null;
  private tail: LruNode | null = null;

  constructor(capacity: number = 200) {
    this.capacity = capacity;
  }

  get(key: string): string | undefined {
    const node = this.map.get(key);
    if (!node) return undefined;
    this.moveToHead(node);
    return node.value;
  }

  set(key: string, value: string): void {
    const existing = this.map.get(key);
    if (existing) {
      existing.value = value;
      this.moveToHead(existing);
      return;
    }

    const node: LruNode = { key, value, prev: null, next: null };
    this.map.set(key, node);
    this.addToHead(node);

    if (this.map.size > this.capacity) {
      this.removeTail();
    }
  }

  private addToHead(node: LruNode): void {
    node.next = this.head;
    node.prev = null;
    if (this.head) {
      this.head.prev = node;
    }
    this.head = node;
    if (!this.tail) {
      this.tail = node;
    }
  }

  private moveToHead(node: LruNode): void {
    if (node === this.head) return;
    this.removeNode(node);
    this.addToHead(node);
  }

  private removeNode(node: LruNode): void {
    if (node.prev) node.prev.next = node.next;
    if (node.next) node.next.prev = node.prev;
    if (node === this.head) this.head = node.next;
    if (node === this.tail) this.tail = node.prev;
  }

  private removeTail(): void {
    if (!this.tail) return;
    this.map.delete(this.tail.key);
    this.removeNode(this.tail);
  }

  clear(): void {
    this.map.clear();
    this.head = null;
    this.tail = null;
  }
}
