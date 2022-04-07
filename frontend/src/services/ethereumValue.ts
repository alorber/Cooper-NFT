import { Failure } from './contracts';

/**
 * This file contains functionality to connect to the coinbase API & retrieve the current ETH exchange rate
 */

type CoinbaseAPIResponse = {
    status: "Success",
    exchangeRate: number
} | Failure;

const COINBASE_API_URL = 'https://api.coinbase.com/v2/exchange-rates?currency=ETH'

export const getETHToUSDRate = async (): Promise<CoinbaseAPIResponse> => {
    const resp = await fetch(COINBASE_API_URL, {
        method: "GET"
    });

    if(resp.ok) {
        const respData = await resp.json();
        const EthToUsd = respData.data.rates['USD'];
        return {status: "Success", exchangeRate: EthToUsd};
    } else {
        return {status: "Failure", error: resp.statusText};
    }
}