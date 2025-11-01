import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';

const sleep = ms => new Promise(r => setTimeout(r, ms));

export class JsonDB {
  #file;
  #lock = Promise.resolve(); // очередь записи

  constructor(filePath) {
    this.#file = path.resolve(filePath);
  }

  async ensureFile() {
    try {
      await fsp.access(this.#file, fs.constants.F_OK);
    } catch {
      await fsp.mkdir(path.dirname(this.#file), { recursive: true });
      await fsp.writeFile(this.#file, JSON.stringify({ recipes: [] }, null, 2));
    }
  }

  async read() {
    await this.ensureFile();
    const raw = await fsp.readFile(this.#file, 'utf8');
    return JSON.parse(raw);
  }

  // Атомарная запись: пишем во временный файл и делаем rename
  async #atomicWrite(obj) {
    const tmp = this.#file + '.tmp';
    const data = JSON.stringify(obj, null, 2);
    await fsp.writeFile(tmp, data);
    await fsp.rename(tmp, this.#file);
  }

  // Все записи проходят через очередь, чтобы избежать гонок
  async write(mutator) {
    this.#lock = this.#lock.then(async () => {
      const db = await this.read();
      const next = await mutator(db);
      await this.#atomicWrite(next);
      // небольшая пауза для файловых систем (иногда полезно на сетевых FS)
      await sleep(5);
    });
    return this.#lock;
  }
}
