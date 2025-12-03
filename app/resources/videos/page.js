'use client';
import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import Link from 'next/link';
import { FiArrowLeft, FiSearch, FiCalendar, FiUser, FiPlay } from 'react-icons/fi';
import { MdVideocam } from 'react-icons/md';

const VideosPage = () => {
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        // Query youtube_videos collection, ordered by most recent first
        const q = query(
          collection(db, 'youtube_videos'),
          where('recipientType', '==', 'all'),
          where('status', '==', 'sent'),
          orderBy('sentAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const videosData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setVideos(videosData);
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  // Filter videos based on search query
  useEffect(() => {
    let filtered = videos;

    if (searchQuery.trim()) {
      filtered = filtered.filter(video =>
        (video.title && video.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (video.description && video.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredVideos(filtered);
    setCurrentPage(1);
  }, [searchQuery, videos]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVideos = filteredVideos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';

    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Extract YouTube video ID from various YouTube URL formats
  const extractYouTubeId = (url) => {
    if (!url) return null;

    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    return null;
  };

  const getEmbedUrl = (videoLink) => {
    const videoId = extractYouTubeId(videoLink);
    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const openVideoModal = (video) => {
    setSelectedVideo(video);
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/resources"
            className="inline-flex items-center text-blue-400 hover:text-blue-500 mb-4 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Back to Resources
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <MdVideocam className="text-3xl text-red-500" />
            <h1 className="text-3xl font-bold">Video Tutorials</h1>
          </div>
          <p className="text-gray-400">Watch educational videos and tutorials</p>
        </div>

        {/* Statistics */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Total Videos</p>
              <p className="text-2xl font-bold text-white mt-1">{videos.length}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Last Updated</p>
              <p className="text-lg font-semibold text-white mt-1">
                {videos.length > 0 ? formatDate(videos[0].sentAt) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-6">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search videos by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            </div>
            <p className="text-gray-400 mt-4">Loading videos...</p>
          </div>
        )}

        {/* Videos Grid */}
        {!loading && filteredVideos.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentVideos.map((video) => {
                const embedUrl = getEmbedUrl(video.videoLink);
                return (
                  <div
                    key={video.id}
                    className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-gray-700 hover:border-red-500 flex flex-col"
                  >
                    {/* Thumbnail */}
                    {embedUrl ? (
                      <div className="relative bg-black h-48 overflow-hidden group cursor-pointer" onClick={() => openVideoModal(video)}>
                        <iframe
                          width="100%"
                          height="100%"
                          src={`${embedUrl}?controls=0`}
                          title={video.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="pointer-events-none"
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                          <button className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 transition-colors">
                            <FiPlay className="w-6 h-6" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-700 h-48 flex items-center justify-center">
                        <span className="text-gray-400">Invalid video link</span>
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{video.title}</h3>
                      
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-1">
                        {video.description || 'No description available'}
                      </p>

                      {/* Footer */}
                      <div className="border-t border-gray-700 pt-3 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <FiCalendar className="w-4 h-4" />
                          {formatDate(video.sentAt)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <FiUser className="w-4 h-4" />
                          Posted by {video.sentBy}
                        </div>
                      </div>

                      {/* Watch Button */}
                      <button
                        onClick={() => openVideoModal(video)}
                        className="mt-4 w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-semibold flex items-center justify-center gap-2"
                      >
                        <FiPlay className="w-4 h-4" />
                        Watch Video
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-sm text-gray-400">
                  Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredVideos.length)} of {filteredVideos.length} videos
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                  >
                    Previous
                  </button>

                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                            currentPage === pageNumber
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-700 text-white hover:bg-gray-600'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && filteredVideos.length === 0 && (
          <div className="text-center py-16 bg-gray-800 rounded-lg border border-gray-700">
            <MdVideocam className="mx-auto text-5xl text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No Videos Available</h3>
            <p className="text-gray-400">
              {searchQuery
                ? 'No videos match your search.'
                : 'No video tutorials available at the moment.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={closeVideoModal}>
          <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto border border-gray-700" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">{selectedVideo.title}</h2>
              <button
                onClick={closeVideoModal}
                className="text-gray-400 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Video Player */}
              {getEmbedUrl(selectedVideo.videoLink) ? (
                <div className="mb-6 bg-black rounded-lg overflow-hidden">
                  <iframe
                    width="100%"
                    height="500"
                    src={getEmbedUrl(selectedVideo.videoLink)}
                    title={selectedVideo.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="bg-gray-800 h-96 flex items-center justify-center rounded-lg mb-6">
                  <span className="text-gray-400">Invalid video link</span>
                </div>
              )}

              {/* Video Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm text-gray-400 mb-1">Description</h3>
                  <p className="text-gray-300">{selectedVideo.description || 'No description available'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Posted by</p>
                    <p className="text-white font-semibold capitalize">{selectedVideo.sentBy}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Date</p>
                    <p className="text-white font-semibold">{formatDate(selectedVideo.sentAt)}</p>
                  </div>
                </div>

                {/* Video Link */}
                <div>
                  <p className="text-sm text-gray-400 mb-2">Video Link</p>
                  <a
                    href={selectedVideo.videoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-500 break-all text-sm"
                  >
                    {selectedVideo.videoLink}
                  </a>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={closeVideoModal}
                className="mt-6 w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideosPage;
