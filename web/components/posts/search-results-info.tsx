"use client";

interface SearchResultsInfoProps {
  searchQuery: string;
  totalResults: number | null;
  isFetching: boolean;
}

export default function SearchResultsInfo({ searchQuery, totalResults, isFetching }: SearchResultsInfoProps) {
  if (isFetching || !searchQuery || totalResults === null) {
    return null;
  }

  return (
    <div className="px-4 py-3 mt-4 mb-4 bg-muted/50 rounded-lg border border-border">
      {totalResults > 0 ? (
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">"{searchQuery}"</span> için{" "}
          <span className="font-semibold text-foreground">{totalResults}</span> sonuç bulundu
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">"{searchQuery}"</span> için sonuç bulunamadı
        </p>
      )}
    </div>
  );
}
