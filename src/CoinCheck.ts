import hmacSHA256 from "crypto-js/hmac-sha256";

/**
 * ティッカー
 */
class Ticker {
  last?: number; // 最後の取引価格
  bid?: number; // 現在の買い注文の最高価格
  ask?: number; // 現在の売り注文の最安価格
  high?: number; // 24時間での最高取引価格
  low?: number; //  24時間での最安取引価格
  volume?: number; // 24時間での取引量
  timestamp?: number; // 現在の時刻
}

/**
 * 残高
 */
class Balance {
  success?: boolean; // 成功フラグ
  jpy?: number; // 日本円の残高
  btc?: number; // ビットコインの残高
  jpy_reserved?: number; // 未決済の買い注文に利用している日本円の合計
  btc_reserved?: number; // 未決済の売り注文に利用しているビットコインの合計
  jpy_lend_in_use?: number; // 貸出申請をしている日本円の合計（現在は日本円貸出の機能を提供していません）
  btc_lend_in_use?: number; // 貸出申請をしているビットコインの合計（現在はビットコイン貸出の機能を提供していません）
  jpy_lent?: number; // 貸出をしている日本円の合計（現在は日本円貸出の機能を提供していません）
  btc_lent?: number; // 貸出をしているビットコインの合計（現在はビットコイン貸出の機能を提供していません）
  jpy_debt?: number; // 借りている日本円の合計
  btc_debt?: number; // 借りている日本円の合計
}

/**
 * 注文結果
 */
class OrderResponse {
  success?: boolean; // 成功フラグ
  id?: number; // 新規注文のID
  rate?: number; // 注文のレート
  amount?: number; // 注文の量
  order_type?: string; // 注文方法 "buy", "sell"
  stop_loss_rate?: number; // 逆指値レート
  pair?: string; // 取引ぺア "btc_jpy"
  created_at?: string; // 注文の作成日時
}

// /**
//  * 各残高の増減分
//  */
// class Funds {
//   btc?: number;
//   jpy?: number;
// }

// /**
//  * 注文履歴
//  */
// class Transaction {
//   id?: number; // トランザクションID
//   order_id?: number; // 注文のID
//   created_at?: string; // 取引が行われた時間
//   funds?: Funds; // 各残高の増減分
//   pair?: string; // 取引ペア
//   rate?: number; // 約定価格
//   fee_currency?: string; // 手数料の通貨
//   fee?: number; // 発生した手数料
//   liquidity?: string; // "T" ( Taker ) or "M" ( Maker )
//   side?: string; // "sell" or "buy"
// }

// /**
//  * 出金用に登録された銀行口座の一覧を取得
//  */
// class BankAccount {
//   id?: number; // ID
//   bank_name?: string; // 銀行名
//   branch_name?: string; // 支店名
//   bank_account_type?: string; // 銀行口座の種類（futsu : 普通口座, toza : 当座預金口座）
//   number?: number; // 口座番号
//   name?: string; // 名義
// }

// /**
//  * エラー情報
//  */
// class CoinCheckError {
//   error?: Error; // エラー情報
//   statusCode?: number; // HTTP ステータスコード
//   message?: string; // CoinCheck サーバメッセージ

//   constructor(error?: Error, statusCode?: number, message?: string) {
//     this.error = error;
//     this.statusCode = statusCode;
//     this.message = message;
//   }
// }

/**
 * コンストラクタ引数
 */
class ConstructorParams {
  accessKey?: string;
  secretKey?: string;
}

/**
 * CoinCheck API for Node.js
 */
class CoinCheck {
  private originUrl: string;
  private accessKey?: string;
  private secretKey?: string;

  constructor(params: ConstructorParams | undefined = undefined) {
    this.originUrl = "https://coincheck.com/api";
    if (params) {
      this.accessKey = params.accessKey;
      this.secretKey = params.secretKey;
    }
  }

  private async apiRequest(
    path: string,
    method = "GET",
    json?: any
  ): Promise<any> {
    const _this = this;
    const resource = `${_this.originUrl}${path}`;
    const body = JSON.stringify(json);
    const headers: any = {};
    if (_this.accessKey && _this.secretKey) {
      headers["ACCESS-KEY"] = _this.accessKey;
      headers["ACCESS-NONCE"] = new Date().getTime();
      let signature = `${headers["ACCESS-NONCE"]}${resource}`;
      if (body) signature += body;
      headers["ACCESS-SIGNATURE"] = hmacSHA256(signature, _this.secretKey);
    }
    const options = {
      method: method,
      headers: headers,
      body: body,
    };

    return await fetch(resource, options);
  }

  /* Public API */

  /**
   * ティッカー
   */
  ticker(): Promise<Ticker> {
    return this.apiRequest("/ticker");
  }

  /**
   * 残高を取得
   * @returns 残高（Balance）
   */
  getBalance(): Promise<Balance> {
    return this.apiRequest("/accounts/balance");
  }

  //   /**
  //    * 最近の取引履歴を取得
  //    * @returns 履歴（Array<Transaction>）
  //    */
  //   async getTransactions() {
  //     let result = await this.apiRequest("/exchange/orders/transactions");
  //     return result.transactions as Array<Transaction>;
  //   }

  //   /**
  //    * 銀行口座一覧を取得
  //    * @returns 履歴（Array<BankAccount>）
  //    */
  //   async getBankAccounts() {
  //     let result = await this.apiRequest("/bank_accounts");
  //     return result.data as Array<BankAccount>;
  //   }

  //   /**
  //    * BTC/JPYのレート取得
  //    * @returns BTC/JPYのレート
  //    */
  //   async getBtcJpyRate() {
  //     let result = await this.apiRequest("/rate/btc_jpy");
  //     return result.rate as number;
  //   }

  /**
       ビットコインを成行買い
       * @param jpy 購入価格（日本円）
       * @returns 注文結果（OrderResponse）
       */
  buyBTC(/*jpy: number*/): Promise<OrderResponse> {
    return this.apiRequest("/exchange/orders", "POST", {
      pair: "btc_jpy",
      order_type: "buy",
      rate: 15914745,
      amount: 0.001,
    });
  }
}

// export { CoinCheck, CoinCheckError };
export { CoinCheck };
