import React from 'react';
import { Heart } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { useWishlist } from '../../hooks/useWishlist';
import './WishlistScreen.css';

const fmt = (d: Date) =>
  d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export const WishlistScreen: React.FC = () => {
  const { items, loading } = useWishlist();

  if (loading) return <LoadingSpinner />;

  return (
    <div className="wishlist">
      <PageHeader
        title="Community Wishlist"
        subtitle="Words users have scanned but aren't in any pack — sorted by demand"
      />

      {items.length === 0 ? (
        <EmptyState
          icon={<Heart size={40} />}
          title="No wishes yet"
          description="When users scan an unknown word and tap 'Wish for it!', it appears here."
        />
      ) : (
        <div className="wishlist__card">
          <table className="wishlist__table">
            <thead>
              <tr>
                <th>#</th>
                <th>Word</th>
                <th>Requests</th>
                <th>Last Wished</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.word} className="wishlist__row">
                  <td className="wishlist__rank">{i + 1}</td>
                  <td className="wishlist__word">{item.word}</td>
                  <td>
                    <span className="wishlist__count">{item.requestCount}</span>
                  </td>
                  <td className="wishlist__date">{fmt(item.lastWishedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
