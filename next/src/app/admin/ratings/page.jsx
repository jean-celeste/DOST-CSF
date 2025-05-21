"use client"

import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function RatingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [ratings, setRatings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [sortConfig, setSortConfig] = useState({
    key: 'date',
    direction: 'desc'
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    // TODO: Fetch real data from your API
    // For now, we'll use mock data
    setRatings([
      {
        id: 1,
        question: "Appropriateness of the Service/Activity",
        rating: "outstanding",
        date: "2024-03-25",
        user: "John Doe"
      },
      {
        id: 2,
        question: "How beneficial is the Service/Activity",
        rating: "very-satisfactory",
        date: "2024-03-24",
        user: "Jane Smith"
      },
      // Add more mock data as needed
    ]);
  }, []);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredRatings = ratings
    .filter(rating => {
      const matchesSearch = rating.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          rating.user.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterRating === 'all' || rating.rating === filterRating;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortConfig.key === 'date') {
        return sortConfig.direction === 'asc' 
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      }
      return sortConfig.direction === 'asc'
        ? a[sortConfig.key].localeCompare(b[sortConfig.key])
        : b[sortConfig.key].localeCompare(a[sortConfig.key]);
    });

  const ratingOptions = [
    { value: 'all', label: 'All Ratings' },
    { value: 'outstanding', label: 'Outstanding' },
    { value: 'very-satisfactory', label: 'Very Satisfactory' },
    { value: 'satisfactory', label: 'Satisfactory' },
    { value: 'fair', label: 'Fair' },
    { value: 'unsatisfactory', label: 'Unsatisfactory' }
  ];

  if (status === "loading") return <div>Loading...</div>;
  if (!session) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ratings Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage all ratings and feedback from users.
        </p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by question or user..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-4">
          <select
            className="rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
          >
            {ratingOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Button className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Ratings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('question')}
                >
                  <div className="flex items-center gap-1">
                    Question
                    {sortConfig.key === 'question' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('rating')}
                >
                  <div className="flex items-center gap-1">
                    Rating
                    {sortConfig.key === 'rating' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('user')}
                >
                  <div className="flex items-center gap-1">
                    User
                    {sortConfig.key === 'user' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-1">
                    Date
                    {sortConfig.key === 'date' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRatings.map((rating) => (
                <tr key={rating.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {rating.question}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      rating.rating === 'outstanding' ? 'bg-green-100 text-green-800' :
                      rating.rating === 'very-satisfactory' ? 'bg-blue-100 text-blue-800' :
                      rating.rating === 'satisfactory' ? 'bg-yellow-100 text-yellow-800' :
                      rating.rating === 'fair' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {rating.rating}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {rating.user}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {rating.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 