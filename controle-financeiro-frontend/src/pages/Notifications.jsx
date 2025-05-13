import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NotificationList from '../components/notifications/NotificationList';
import api from '../../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

const fetchNotifications = async () => {
  try {
    const res = await api.get('/notifications');
    setNotifications(res.data);
  } catch (err) {
    console.error('Erro ao buscar notificações:', err);
  }
};

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Notificações</h1>
      <NotificationList notifications={notifications} />
    </div>
  );
};

export default Notifications;
