import React from 'react';

const NotificationItem = ({ notification, onMarkAsRead }) => {
  return (
    <div className={`p-4 mb-2 rounded shadow ${notification.read ? 'bg-gray-100' : 'bg-white'}`}>
      <p className="text-sm text-gray-700">{notification.message}</p>
      <p className="text-xs text-gray-500">{new Date(notification.createdAt).toLocaleString()}</p>
      {!notification.read && (
        <button
          onClick={() => onMarkAsRead(notification.id)}
          className="mt-2 text-xs text-blue-600 hover:underline"
        >
          Marcar como lida
        </button>
      )}
    </div>
  );
};

export default NotificationItem;
