/// <reference types="vite/client" />

declare namespace chrome {
  namespace scripting {
    interface ScriptInjection<Args extends unknown[], Result> {
      target: { tabId: number };
      func?: (...args: Args) => Result;
      files?: string[];
      args?: Args;
    }

    function executeScript<Args extends unknown[], Result>(
      injection: ScriptInjection<Args, Result>,
    ): Promise<{ result: Result }[]>;
  }

  namespace tabs {
    interface Tab {
      id?: number;
      url?: string;
      title?: string;
    }

    interface QueryInfo {
      active?: boolean;
      currentWindow?: boolean;
    }

    function query(queryInfo: QueryInfo): Promise<Tab[]>;
  }

  namespace storage {
    interface StorageArea {
      get(keys: string | string[] | null): Promise<{ [key: string]: unknown }>;
      set(items: { [key: string]: unknown }): Promise<void>;
      remove(keys: string | string[]): Promise<void>;
    }

    const local: StorageArea;
    const sync: StorageArea;
  }
}
