import React, { useState } from 'react';
import { Users, Server, Edit2, Trash2, Plus } from 'lucide-react';
import type { Organization, Peer } from '../../types';
import Button from '../ui/Button';

interface OrganizationCardProps {
  organization: Organization;
  onUpdate: (orgId: string, updates: Partial<Organization>) => void;
  onDelete: (orgId: string) => void;
  onAddPeer: (orgId: string) => void;
  onUpdatePeer: (orgId: string, peerId: string, updates: Partial<Peer>) => void;
  onDeletePeer: (orgId: string, peerId: string) => void;
  isDark: boolean;
}

const OrganizationCard: React.FC<OrganizationCardProps> = ({
  organization,
  onUpdate,
  onDelete,
  onAddPeer,
  onUpdatePeer,
  onDeletePeer,
  isDark,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingPeerId, setEditingPeerId] = useState<string | null>(null);
  const [orgName, setOrgName] = useState(organization.name);
  const [peerName, setPeerName] = useState('');
  const [peerPort, setPeerPort] = useState(0);

  const handleSaveOrg = () => {
    onUpdate(organization.id, { name: orgName });
    setIsEditing(false);
  };

  const handleSavePeer = (peerId: string) => {
    const peer = organization.peers.find(p => p.id === peerId);
    if (peer) {
      onUpdatePeer(organization.id, peerId, { 
        name: peerName || peer.name, 
        port: peerPort || peer.port 
      });
    }
    setEditingPeerId(null);
  };

  const startEditingPeer = (peer: Peer) => {
    setPeerName(peer.name);
    setPeerPort(peer.port);
    setEditingPeerId(peer.id);
  };

  return (
    <div 
      className={`border rounded-lg p-4 ${
        isDark ? 'border-gray-700 hover:border-indigo-500' : 'hover:border-indigo-300'
      } transition-colors duration-200 hover-scale`}
    >
      <div className="flex items-center justify-between mb-2">
        {isEditing ? (
          <input
            type="text"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            className={`block w-full rounded-lg ${
              isDark 
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          />
        ) : (
          <h3 className="text-sm font-medium">{organization.name}</h3>
        )}
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => onAddPeer(organization.id)}
            variant="secondary"
            size="sm"
            icon={Plus}
          >
            Add Peer
          </Button>
          <Button
            onClick={() => isEditing ? handleSaveOrg() : setIsEditing(true)}
            variant="outline"
            size="sm"
            icon={Edit2}
          >
            {isEditing ? 'Save' : 'Edit'}
          </Button>
          <Button
            onClick={() => onDelete(organization.id)}
            variant="danger"
            size="sm"
            icon={Trash2}
          >
            Delete
          </Button>
        </div>
      </div>
      <div className="text-sm opacity-70">
        <div>Domain: {organization.domain}</div>
        <div>MSP ID: {organization.mspID}</div>
        <div className="mt-2">
          <strong>Peers ({organization.peers.length}):</strong>
          <div className="ml-2 space-y-1">
            {organization.peers.map(peer => (
              <div key={peer.id} className="flex items-center justify-between py-1">
                {editingPeerId === peer.id ? (
                  <div className="flex items-center space-x-2 flex-grow">
                    <input
                      type="text"
                      value={peerName}
                      onChange={(e) => setPeerName(e.target.value)}
                      className={`block w-32 rounded-lg ${
                        isDark 
                          ? 'bg-gray-800 border-gray-700 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } border px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    />
                    <input
                      type="number"
                      value={peerPort}
                      onChange={(e) => setPeerPort(parseInt(e.target.value))}
                      className={`block w-24 rounded-lg ${
                        isDark 
                          ? 'bg-gray-800 border-gray-700 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } border px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    />
                    <Button
                      onClick={() => setEditingPeerId(null)}
                      variant="outline"
                      size="sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleSavePeer(peer.id)}
                      variant="primary"
                      size="sm"
                    >
                      Save
                    </Button>
                  </div>
                ) : (
                  <>
                    <span>{peer.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs opacity-70">Port: {peer.port}</span>
                      <Button
                        onClick={() => startEditingPeer(peer)}
                        variant="outline"
                        size="sm"
                        icon={Edit2}
                      />
                      <Button
                        onClick={() => onDeletePeer(organization.id, peer.id)}
                        variant="danger"
                        size="sm"
                        icon={Trash2}
                      />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationCard;