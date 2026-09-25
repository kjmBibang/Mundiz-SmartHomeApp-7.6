import React, {
    createContext,
    useContext,
    useState,
    useEffect,
} from 'react';
import { Device, SensorData } from '../models/IoTModels';
import * as IoTService from '../services/IoTService';

type IoTContextType = {
    devices: Device[];
    sensors: SensorData | null;
    toggleDevice: (id: number, value: boolean) => void;
    gatewayConnected: boolean;
    pendingDeviceIds: number[];
    loading: boolean;
    refresh: () => void;
};

const IoTContext = createContext<IoTContextType | undefined>(undefined);

export function IoTProvider({ children }: { children: React.ReactNode }) {
    const [devices, setDevices] = useState<Device[]>([]);
    const [sensors, setSensors] = useState<SensorData | null>(null);
    const [pendingDeviceIds, setPendingDeviceIds] = useState<number[]>([]);
    const [gatewayConnected, setGatewayConnected] = useState(true);
    const [loading, setLoading] = useState(true);

    /*useEffect(() => {
        (async () => {
            try {
                const [deviceList, sensorData] = await Promise.all([
                    IoTService.getDevices(),
                    IoTService.getSensorData(),
                ]);
                setDevices(deviceList);
                setSensors(sensorData);
                setGatewayConnected(true);
            } catch (err) {
                setGatewayConnected(false);
            } finally {
                setLoading(false);
            }
        })();
    }, []);
*/
    const toggleDevice = async (id: number, value: boolean) => {
        setPendingDeviceIds((prev) => [...prev, id]);

        try {
            const updated = await IoTService.updateDeviceStatus(id, value);

            setDevices((prev) =>
                prev.map((d) => (d.id === id ? updated : d))
            );
            setGatewayConnected(true);
        } catch (err) {
        
            setGatewayConnected(false);
        } finally {
            setPendingDeviceIds((prev) => prev.filter((d) => d !== id));
        }
    };

    const loadData = async () => {
        setLoading(true);
    
        const results = await Promise.allSettled([
            IoTService.getDevices(),
            IoTService.getSensorData(),
        ]);
    
        const [devicesResult, sensorsResult] = results;
    
        if (devicesResult.status === 'fulfilled') {
            setDevices(devicesResult.value);
        }
    
        if (sensorsResult.status === 'fulfilled') {
            setSensors(sensorsResult.value);
        }
    
        const bothFailed =
            devicesResult.status === 'rejected' &&
            sensorsResult.status === 'rejected';
    
        setGatewayConnected(!bothFailed);
        setLoading(false);
    };
    
    useEffect(() => {
        loadData();
    }, []);

    return (
        <IoTContext.Provider
            value={{
                devices,
                sensors,
                toggleDevice,
                gatewayConnected,
                pendingDeviceIds,
                loading,
                refresh: loadData,
            }}
        >
            {children}
        </IoTContext.Provider>
    );
}

export function useIoT() {
    const context = useContext(IoTContext);
    if (!context) {
        throw new Error('useIoT must be used inside IoTProvider');
    }
    return context;
}