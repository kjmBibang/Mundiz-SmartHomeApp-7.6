import { Device, SensorData } from '../models/IoTModels';

let devices: Device[] = [
  {
    id: 1,
    name: 'Living Room Light',
    type: 'Smart Light',
    icon: 'bulb-outline' as const,
    status: true,
  },
  {
    id: 2,
    name: 'Bedroom Fan',
    type: 'Smart Fan',
    icon: 'sync-outline' as const,
    status: false,
  },
  {
    id: 3,
    name: 'Front Door Lock',
    type: 'Smart Lock',
    icon: 'lock-closed-outline' as const,
    status: true,
  },
];

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const maybeFail = (failRate = 0.15) => {
  if (Math.random() < failRate) {
    throw new Error('Network error: failed to reach IoT gateway');
  }
};

export async function getSensorData(): Promise<SensorData> {
  await delay(1000);
  maybeFail();

  return {
    temperature: Math.round(60 + Math.random() * 40),
    humidity: Math.round(30 + Math.random() * 50),
    lightLevel: Math.round(Math.random() * 1000),
  };
}

export async function getDevices(): Promise<Device[]> {
  await delay(1500);
  maybeFail();

  return devices.map((d) => ({ ...d }));
}

export async function updateDeviceStatus(
  id: number,
  status: boolean
): Promise<Device> {
  await delay(1200);
  maybeFail();

  const device = devices.find((d) => d.id === id);

  if (!device) {
    throw new Error(`Device ${id} not found`);
  }

  device.status = status;

  return { ...device };
}