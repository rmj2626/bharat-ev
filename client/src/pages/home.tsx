import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { VehicleFilter, VehicleWithDetails } from "@shared/types";
import FilterSection from "@/components/filter-section";
import VehicleCard from "@/components/vehicle-card";
import Pagination from "@/components/pagination";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { toast } = useToast();
  const [filter, setFilter] = useState<VehicleFilter>({
    page: 1,
    perPage: 10,
    sortBy: "popular",
  });

  // Fetch vehicles with filter
  const { data: vehiclesData, isLoading, isError } = useQuery({
    queryKey: ["/api/vehicles", filter],
    queryFn: async () => {
      // Convert filter to query params
      const params = new URLSearchParams();
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(`${key}[]`, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
      
      const res = await fetch(`/api/vehicles?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to fetch vehicles");
      }
      return res.json();
    },
  });

  // Handle filter changes
  const handleFilterChange = (newFilter: Partial<VehicleFilter>) => {
    setFilter((prev) => ({ ...prev, ...newFilter }));
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilter((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Show error toast if query fails
  useEffect(() => {
    if (isError) {
      toast({
        title: "Error",
        description: "Failed to load vehicles. Please try again later.",
        variant: "destructive",
      });
    }
  }, [isError, toast]);

  return (
    <main className="mx-auto py-8" style={{ width: '60%', maxWidth: '1280px' }}>
      {/* Page Title */}
      <div className="border-b border-gray-200 pb-5 mb-6">
        <h1 className="text-2xl font-bold leading-tight text-gray-900">All Electric Vehicles in India</h1>
        <p className="mt-2 text-sm text-gray-500">
          Browse, filter, and compare detailed specifications of all EVs available in the Indian market
        </p>
      </div>

      {/* Container for both filter and results */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Filter Section */}
        <div className="border-b border-gray-200">
          <FilterSection
            filter={filter}
            totalResults={vehiclesData?.pagination?.total || 0}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Results Section - Slightly inset with subtle shadow */}
        <div className="bg-gray-50 p-4">
          {/* Loading State */}
          {isLoading && (
            <div className="my-12 flex justify-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="rounded-full bg-gray-200 h-12 w-12 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2.5"></div>
                <div className="h-3 bg-gray-200 rounded w-36"></div>
              </div>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="my-8 text-center">
              <div className="bg-red-50 p-6 rounded-lg shadow-inner">
                <h3 className="text-lg font-medium text-red-800">Failed to load vehicles</h3>
                <p className="mt-2 text-sm text-red-700">
                  There was an error loading the vehicle listings. Please try again later.
                </p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && vehiclesData?.data?.length === 0 && (
            <div className="my-8 text-center">
              <div className="bg-white p-6 rounded-lg shadow-inner">
                <h3 className="text-lg font-medium text-gray-900">No vehicles found</h3>
                <p className="mt-2 text-sm text-gray-500">
                  No electric vehicles match your current filter criteria. Try adjusting your filters.
                </p>
              </div>
            </div>
          )}

          {/* Vehicle Listings */}
          {!isLoading && !isError && vehiclesData?.data?.length > 0 && (
            <div className="space-y-4 my-4">
              {vehiclesData.data.map((vehicle: VehicleWithDetails) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && !isError && vehiclesData?.data?.length > 0 && (
            <div className="mt-6 pb-2">
              <Pagination
                currentPage={vehiclesData.pagination.page}
                totalPages={vehiclesData.pagination.totalPages}
                perPage={vehiclesData.pagination.perPage}
                total={vehiclesData.pagination.total}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
