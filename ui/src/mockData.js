export const menuItems = [
  {
    id: 1,
    name: '아메리카노 (ICE)',
    description: '시원하고 깔끔한 맛',
    price: 4000,
    imageUrl: 'https://via.placeholder.com/150',
    options: [
      { id: 1, name: '샷 추가', priceDelta: 500 },
      { id: 2, name: '시럽 추가', priceDelta: 0 },
    ],
  },
  {
    id: 2,
    name: '아메리카노 (HOT)',
    description: '따뜻하고 부드러운 맛',
    price: 4000,
    imageUrl: 'https://via.placeholder.com/150',
    options: [
      { id: 1, name: '샷 추가', priceDelta: 500 },
      { id: 2, name: '시럽 추가', priceDelta: 0 },
    ],
  },
  {
    id: 3,
    name: '카페라떼',
    description: '고소한 우유와 에스프레소의 조화',
    price: 5000,
    imageUrl: 'https://via.placeholder.com/150',
    options: [
      { id: 1, name: '샷 추가', priceDelta: 500 },
      { id: 2, name: '두유로 변경', priceDelta: 500 },
    ],
  },
    {
    id: 4,
    name: '바닐라 라떼',
    description: '달콤한 바닐라 시럽이 들어간 라떼',
    price: 5500,
    imageUrl: 'https://via.placeholder.com/150',
    options: [
      { id: 1, name: '샷 추가', priceDelta: 500 },
      { id: 2, name: '시럽 없이', priceDelta: 0 },
    ],
  },
];

export const adminStats = {
  totalOrders: 25,
  accepted: 5,
  inProgress: 8,
  completed: 12,
};

export const inventoryItems = [
  { id: 1, name: '아메리카노 (ICE)', quantity: 15 },
  { id: 2, name: '아메리카노 (HOT)', quantity: 4 },
  { id: 3, name: '카페라떼', quantity: 0 },
];

export const orders = [
  {
    id: 1,
    createdAt: '2025-10-20T13:00:00',
    items: [
      { name: '아메리카노 (ICE)', quantity: 1, options: ['샷 추가'] },
    ],
    totalPrice: 4500,
    status: 'pending', // or '주문 접수'
  },
  {
    id: 2,
    createdAt: '2025-10-20T13:05:00',
    items: [
      { name: '카페라떼', quantity: 2, options: [] },
    ],
    totalPrice: 10000,
    status: 'pending',
  },
    {
    id: 3,
    createdAt: '2025-10-20T13:02:00',
    items: [
      { name: '아메리카노 (HOT)', quantity: 1, options: [] },
      { name: '바닐라 라떼', quantity: 1, options: ['두유로 변경'] },
    ],
    totalPrice: 9500,
    status: 'inProgress', // or '제조 중'
  },
];