/**
 * P6 KRAKEN KEEPER - Silver Ledger
 * 
 * @port 6
 * @tier SILVER
 * @verb STORE
 */

export class KrakenLedger {
  private entries: any[] = [];
  store(entry: any) {
    this.entries.push(entry);
  }
}
