import { useState, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_LB_BASE_URL ?? (import.meta.env.PROD ? '' : 'http://localhost:4000');

/**
 * Custom hook for Load Balancer API interactions
 * Centralizes all API calls and state management
 */
export function useLoadBalancerApi() {
    const [servers, setServers] = useState([]);
    const [totals, setTotals] = useState({ requests: 0, activeTargets: 0, loadBalancingEnabled: true });
    const [recent, setRecent] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [updatingServer, setUpdatingServer] = useState(null);
    const [error, setError] = useState(null);
    const [loadBalancingEnabled, setLoadBalancingEnabled] = useState(true);

    // A/B Testing State
    const [quickSimResults, setQuickSimResults] = useState(null);

    const fetchState = useCallback(async () => {
        setError(null);
        try {
            const response = await fetch(`${API_BASE}/api/servers`);
            if (!response.ok) throw new Error('Gagal memuat data load balancer');
            const data = await response.json();
            setServers(data.servers ?? []);
            setTotals(data.totals ?? {});
            setRecent(data.recentDispatches ?? []);
            if (data.totals?.loadBalancingEnabled !== undefined) {
                setLoadBalancingEnabled(data.totals.loadBalancingEnabled);
            }
        } catch (err) {
            setError(err.message);
        }
    }, []);

    const toggleLoadBalancing = useCallback(async (enabled) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE}/api/lb-toggle`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enabled }),
            });
            const payload = await response.json();
            if (!response.ok) throw new Error(payload?.message ?? 'Gagal mengubah status load balancing');
            setLoadBalancingEnabled(payload.loadBalancingEnabled);
            return payload;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const sendTraffic = useCallback(async (count) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE}/api/traffic`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ count }),
            });
            const payload = await response.json();
            if (!response.ok) throw new Error(payload?.message ?? 'Gagal mengirim trafik');
            setServers(payload.servers ?? []);
            setTotals(payload.totals ?? {});
            setRecent(payload.recentDispatches ?? payload.dispatched ?? []);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateServer = useCallback(async (id, patch) => {
        setUpdatingServer(id);
        setError(null);
        try {
            const response = await fetch(`${API_BASE}/api/servers/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(patch),
            });
            const payload = await response.json();
            if (!response.ok) throw new Error(payload?.message ?? 'Gagal mengubah server');
            setServers(payload.servers ?? []);
            setTotals(payload.totals ?? {});
        } catch (err) {
            setError(err.message);
        } finally {
            setUpdatingServer(null);
        }
    }, []);

    const resetSimulation = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE}/api/reset`, { method: 'POST' });
            const payload = await response.json();
            setServers(payload.servers ?? []);
            setTotals(payload.totals ?? {});
            setRecent(payload.recentDispatches ?? []);
            setQuickSimResults(null);
        } catch (err) {
            setError('Tidak dapat mereset simulasi');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const runQuickSimulation = useCallback(async (config) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE}/api/ab-test/quick-sim`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });
            const payload = await response.json();
            if (!response.ok) throw new Error(payload?.message ?? 'Gagal menjalankan simulasi');
            setQuickSimResults(payload);
            return payload;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        // State
        servers,
        totals,
        recent,
        isLoading,
        updatingServer,
        error,
        quickSimResults,
        loadBalancingEnabled,
        // Actions
        fetchState,
        sendTraffic,
        updateServer,
        resetSimulation,
        runQuickSimulation,
        setQuickSimResults,
        toggleLoadBalancing,
    };
}
