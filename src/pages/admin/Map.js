"use client"

import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useLocation, useOutletContext } from 'react-router-dom';
import axios from 'axios';

const BASE = process.env.REACT_APP_SERVER_BASE_URL || '/parking-ticket/api';

const MapViewSetter = ({ location, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (location) map.setView([location.latitude, location.longitude], zoom);
  }, [location, map, zoom]);
  return null;
};

const ChallanMarkers = ({ challans, zoom }) => {
  const radius = Math.max(5, 10 - zoom);

  return (
    <>
      {challans.map((c, i) => {
        const color = c.status === 'Pending' ? 'red' : 'blue';
        return (
          <CircleMarker key={i} center={[c.latitude, c.longitude]} radius={radius} fillColor={color} color={color} fillOpacity={0.7} stroke={false}>
            <Popup>
              <div>
                <h4>Challan Details</h4>
                <p><strong>Time:</strong> {c.created_at}</p>
                <p><strong>Status:</strong> {c.status}</p>
                <p><strong>Assigned To:</strong> {c.assigned_to || 'N/A'}</p>
                <p><strong>Reviewed By:</strong> {c.last_reviewed_by || 'N/A'}</p>
                <p><strong>Reviewed At:</strong> {c.last_modified || 'N/A'}</p>
                <p><strong>Complainee:</strong> {c.phone || 'N/A'}</p>
                <p><strong>Vehicle No:</strong> {c.registration_plate || 'N/A'}</p>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
};

const MapBoundsSearch = ({ setChallans, setZoom }) => {
  const map = useMap();

  const handleSearch = useCallback(() => {
    const bounds = map.getBounds();
    const latMin = bounds.getSouthWest().lat;
    const lngMin = bounds.getSouthWest().lng;
    const latMax = bounds.getNorthEast().lat;
    const lngMax = bounds.getNorthEast().lng;

    axios.get(`${BASE}/admin/locations?latMin=${latMin}&lngMin=${lngMin}&latMax=${latMax}&lngMax=${lngMax}`)
      .then((res) => {
        const data = res.data;
        setChallans(data.data || []);
        if (data.total > 100) {
          alert(`Found ${data.total} matching complaints in this area. Only displaying the first 100. Please zoom in to narrow down your search.`);
        }
      })
      .catch(console.error);
  }, [map, setChallans]);

  useEffect(() => {
    if (map) {
      handleSearch();
      const onZoomEnd = () => {
        setZoom(map.getZoom());
      };
      map.on('zoomend', onZoomEnd);
      return () => {
        map.off('zoomend', onZoomEnd);
      };
    }
  }, [map, handleSearch, setZoom]);

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000]">
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          handleSearch();
        }}
        onMouseDown={(e) => e.stopPropagation()}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-full shadow-lg transition duration-200 text-sm whitespace-nowrap"
      >
        Search this area
      </button>
    </div>
  );
};

export default function AdminMap() {
  const [zoom, setZoom] = useState(5);
  const [challans, setChallans] = useState([]);
  const [challanLocation, setChallanLocation] = useState(null);
  const { isOpen } = useOutletContext();
  const { search } = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(search);
    const id = params.get('id');
    const zoomParam = params.get('zoom');
    if (id) {
      axios.get(`${BASE}/admin/locations/${id}`)
        .then((res) => setChallanLocation(res.data))
        .catch(console.error);
      setZoom(zoomParam ? parseInt(zoomParam, 10) : 5);
    }
  }, [search]);

  return (
    <div
      className="bg-white rounded-3xl flex-grow flex flex-col p-4 md:p-6 overflow-hidden relative"
      style={{ opacity: isOpen && window.innerWidth < 768 ? 0 : 1 }}
    >
      <div className="rounded-3xl overflow-hidden flex-grow min-h-0 relative">
        <MapContainer
          center={challanLocation ? [challanLocation.latitude, challanLocation.longitude] : [20.5937, 78.9629]}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <ChallanMarkers challans={challans} zoom={zoom} />
          {challanLocation && (
            <CircleMarker center={[challanLocation.latitude, challanLocation.longitude]} radius={10} fillColor="green" color="green" fillOpacity={0.7} stroke={false}>
              <Popup>
                <div>
                  <h4>Focused Challan</h4>
                  <p><strong>Time:</strong> {challanLocation.created_at}</p>
                  <p><strong>Status:</strong> {challanLocation.status}</p>
                  <p><strong>Assigned To:</strong> {challanLocation.assigned_to || 'N/A'}</p>
                  <p><strong>Reviewed By:</strong> {challanLocation.last_reviewed_by || 'N/A'}</p>
                  <p><strong>Reviewed At:</strong> {challanLocation.last_modified || 'N/A'}</p>
                  <p><strong>Complainee:</strong> {challanLocation.phone || 'N/A'}</p>
                  <p><strong>Vehicle No:</strong> {challanLocation.registration_plate || 'N/A'}</p>
                </div>
              </Popup>
            </CircleMarker>
          )}
          <MapViewSetter location={challanLocation} zoom={zoom} />
          <MapBoundsSearch setChallans={setChallans} setZoom={setZoom} />
        </MapContainer>
      </div>
    </div>
  );
}
