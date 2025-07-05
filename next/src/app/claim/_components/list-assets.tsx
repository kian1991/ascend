import { NexusSDK, type UserAsset } from '@avail-project/nexus';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';

export function ListAssets() {
    const [assetList, setAssetList] = useState<UserAsset[]>([]);
    const { wallets } = useWallets();
    const { ready } = usePrivy();

    useEffect(() => {
        // if (!wallets?.[0] || wallets.length > 1) return;
        async function listAssets() {
            const sdk = new NexusSDK({
                network: 'testnet'
            });
            // @ts-ignore
            await sdk.initialize(window.ethereum);
            const balances = await sdk.getUnifiedBalances();
            console.log(balances);

            setAssetList(balances);
        }
        listAssets();
    }, []);

    if (!ready) return null;

    return (
        <table className="table w-full">
            {assetList.map((asset) => (
                <AssetRow asset={asset} key={asset.symbol} />
            ))}
        </table>
    );
}

function AssetRow({ asset }: { asset: UserAsset }) {
    return (
        <>
            <tr className="bg-accent font-bold">
                <td>
                    <img src={asset.icon} alt={asset.symbol} className="w-8 h-8 rounded-full" />
                </td>
                <td>{asset.symbol}</td>
                <td>{asset.balance.toLocaleString()}</td>
                <td>${asset.balanceInFiat}</td>
            </tr>
            {asset.breakdown.map((assetBreakdown) => (
                <tr className="bg-base-100 text-sm" key={assetBreakdown.chain.id}>
                    <td>
                        <img
                            src={assetBreakdown.chain.logo}
                            alt={assetBreakdown.chain.name}
                            className="w-4 h-4 ml-2 rounded-full"
                        />
                    </td>
                    <td className="pl-8">{assetBreakdown.chain.name}</td>
                    <td>{assetBreakdown.balance.toLocaleString()}</td>
                    <td>${assetBreakdown.balanceInFiat}</td>
                </tr>
            ))}
        </>
    );
}
