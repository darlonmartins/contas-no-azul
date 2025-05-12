import React from 'react';

const NotificationList = ({ notifications }) => {
  if (!notifications.length) return <p className="text-gray-500">Nenhuma notificação no momento.</p>;

  return (
    <ul className="space-y-2">
      {notifications.map((notification) => (
        <li
          key={notification.id}
          className={`border p-3 rounded shadow-sm ${
            notification.read ? 'bg-gray-100' : 'bg-white'
          }`}
        >
          <p className="font-semibold">{notification.title}</p>
          <p className="text-sm text-gray-700">{notification.message}</p>
          <p className="text-xs text-gray-500">
            {new Date(notification.createdAt).toLocaleString()}
          </p>
        </li>
      ))}
    </ul>
  );
};

export default NotificationList;
