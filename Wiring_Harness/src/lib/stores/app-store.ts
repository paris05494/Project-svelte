import { writable } from 'svelte/store';
import type { IHypertacVisualizationData, IHypertacSlot } from '$lib/model/Hypertac';
interface AppStore {
    isLoading: boolean;
    error: string | null;
    status: string;
    visualizationData: IHypertacVisualizationData | null;
    openSlotDetails: Set<string>;
    currentFileName: string | null;
}
const initialStore: AppStore = {
    isLoading: false,
    error: null,
    status: 'Ready to upload Excel file.',
    visualizationData: null,
    openSlotDetails: new Set<string>(),
    currentFileName: null,
};
const { subscribe, set, update } = writable<AppStore>(initialStore);
export const appStore = {
    subscribe,
    setLoading: (loading: boolean) => update(store => ({ ...store, isLoading: loading })),
    setError: (error: string | null) => update(store => ({ ...store, error: error })),
    updateStatus: (status: string) => update(store => ({ ...store, status: status })),
    setVisualizationData: (data: IHypertacVisualizationData | null, fileName: string | null) => update(store => ({ ...store, visualizationData: data, currentFileName: fileName, error: null })),
    
    toggleSlotDetail: (slotId: string) => {
        update(store => {
            const newSet = new Set(store.openSlotDetails);
            if (newSet.has(slotId)) {
                newSet.delete(slotId);
            } else {
                newSet.add(slotId);
            }
            return { ...store, openSlotDetails: newSet };
        });
    },
    closeSlotDetail: (slotId: string) => {
        update(store => {
            const newSet = new Set(store.openSlotDetails);
            newSet.delete(slotId);
            return { ...store, openSlotDetails: newSet };
        });
    },
    closeAllSlotDetails: () => {
        update(store => ({ ...store, openSlotDetails: new Set<string>() }));
    },
    reset: () => set(initialStore)
};
