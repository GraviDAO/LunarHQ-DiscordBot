import { AbstractCollection, IndexedCollection } from "../shared/apiTypes";

class Repository {
  private _abstractCollections: AbstractCollection[] = [];
  private _indexedCollections: IndexedCollection[] = [];

  public saveCollections(collections: {
    abstractCollections?: AbstractCollection[];
    indexedCollections?: IndexedCollection[];
  }) {
    this._abstractCollections = collections.abstractCollections ?? [];
    this._indexedCollections = collections.indexedCollections ?? [];
  }

  public get abstractCollections(): AbstractCollection[] {
    return this._abstractCollections;
  }

  public get indexedCollections(): IndexedCollection[] {
    return this._indexedCollections;
  }

  public getIndexCollectionByChain(chain: string): IndexedCollection[] {
    return this._indexedCollections.filter(
      (c) => c.blockchain.name === chain || c.blockchain.chainId === chain
    );
  }
}

export default new Repository();
