import { defineStore } from 'pinia';
import { apiFetch } from '~/utils/api-fetch';
import type {
  Procurement,
  CreateProcurementInput,
  UpdateProcurementInput,
  FilterProcurementsInput,
  UploadDocumentInput,
  ProcurementDocument,
} from '~/interfaces/procurement/procurement.interface';

interface ProcurementState {
  procurements: Procurement[];
  currentProcurement: Procurement | null;
  loading: boolean;
  error: string | null;
  categories: string[];
  types: string[];
  locations: string[];
}

export const useProcurementStore = defineStore('procurement', {
  state: (): ProcurementState => ({
    procurements: [],
    currentProcurement: null,
    loading: false,
    error: null,
    categories: [],
    types: [],
    locations: [],
  }),

  getters: {
    getProcurementById: (state) => (id: number) => {
      return state.procurements.find((p) => p.id === id);
    },

    publishedProcurements: (state) => {
      return state.procurements.filter((p) => p.status === 'published');
    },

    draftProcurements: (state) => {
      return state.procurements.filter((p) => p.status === 'draft');
    },

    totalProcurements: (state) => state.procurements.length,
  },

  actions: {
    async fetchProcurements(filters?: FilterProcurementsInput) {
      this.loading = true;
      this.error = null;
      try {
        const params = new URLSearchParams();
        if (filters?.search) params.append('search', filters.search);
        if (filters?.status) params.append('status', filters.status);
        if (filters?.location) params.append('location', filters.location);
        if (filters?.category) params.append('category', filters.category);
        if (filters?.type) params.append('type', filters.type);
        if (filters?.createdBy) params.append('createdBy', filters.createdBy.toString());
        if (filters?.deadlineFrom) params.append('deadlineFrom', filters.deadlineFrom);
        if (filters?.deadlineTo) params.append('deadlineTo', filters.deadlineTo);

        const query = params.toString();
        const url = query ? `/procurements?${query}` : '/procurements';

        this.procurements = await apiFetch<Procurement[]>(url);
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch procurements';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchProcurementById(id: number) {
      this.loading = true;
      this.error = null;
      try {
        this.currentProcurement = await apiFetch<Procurement>(`/procurements/${id}`);
        return this.currentProcurement;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch procurement';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createProcurement(input: CreateProcurementInput) {
      this.loading = true;
      this.error = null;
      try {
        const procurement = await apiFetch<Procurement>('/procurements', {
          method: 'POST',
          body: input,
        });
        this.procurements.unshift(procurement);
        return procurement;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to create procurement';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateProcurement(input: UpdateProcurementInput) {
      this.loading = true;
      this.error = null;
      try {
        const procurement = await apiFetch<Procurement>(`/procurements/${input.id}`, {
          method: 'PATCH',
          body: input,
        });

        const index = this.procurements.findIndex((p) => p.id === input.id);
        if (index !== -1) {
          this.procurements[index] = procurement;
        }

        if (this.currentProcurement?.id === input.id) {
          this.currentProcurement = procurement;
        }

        return procurement;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to update procurement';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteProcurement(id: number) {
      this.loading = true;
      this.error = null;
      try {
        await apiFetch(`/procurements/${id}`, {
          method: 'DELETE',
        });

        this.procurements = this.procurements.filter((p) => p.id !== id);
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to delete procurement';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async uploadDocument(procurementId: number, input: UploadDocumentInput) {
      this.loading = true;
      this.error = null;
      try {
        const document = await apiFetch<ProcurementDocument>(
          `/procurements/${procurementId}/documents`,
          {
            method: 'POST',
            body: input,
          },
        );

        // Update current procurement if loaded
        if (this.currentProcurement?.id === procurementId) {
          this.currentProcurement.documents = [
            ...(this.currentProcurement.documents || []),
            document,
          ];
        }

        return document;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to upload document';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteDocument(documentId: number) {
      this.loading = true;
      this.error = null;
      try {
        await apiFetch(`/procurements/documents/${documentId}`, {
          method: 'DELETE',
        });

        // Update current procurement documents
        if (this.currentProcurement?.documents) {
          this.currentProcurement.documents = this.currentProcurement.documents.filter(
            (d) => d.id !== documentId,
          );
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to delete document';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchCategories() {
      // Extract unique categories from procurements
      this.categories = [...new Set(this.procurements.map((p) => p.category))];
    },

    async fetchTypes() {
      // Extract unique types from procurements
      this.types = [...new Set(this.procurements.map((p) => p.type))];
    },

    async fetchLocations() {
      // Extract unique locations from procurements
      this.locations = [...new Set(this.procurements.map((p) => p.location))];
    },
  },
});
