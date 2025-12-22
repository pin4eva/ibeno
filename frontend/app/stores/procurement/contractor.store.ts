import { defineStore } from 'pinia';
import { apiFetch } from '~/utils/api-fetch';
import type {
  Contractor,
  CreateContractorInput,
  FilterContractorsInput,
  UpdateContractorInput,
} from '~/interfaces/procurement/contractor.interface';

interface ContractorState {
  contractors: Contractor[];
  currentContractor: Contractor | null;
  loading: boolean;
  error: string | null;
}

export const useContractorStore = defineStore('contractor', {
  state: (): ContractorState => ({
    contractors: [],
    currentContractor: null,
    loading: false,
    error: null,
  }),

  getters: {
    getContractorByNo: (state) => (contractorNo: string) => {
      return state.contractors.find((c) => c.contractorNo === contractorNo);
    },

    activeContractors: (state) => {
      return state.contractors.filter((c) => c.status === 'ACTIVE');
    },

    totalContractors: (state) => state.contractors.length,
  },

  actions: {
    async fetchContractors(filters?: FilterContractorsInput) {
      this.loading = true;
      this.error = null;
      try {
        const params = new URLSearchParams();
        if (filters?.search) params.append('search', filters.search);
        if (filters?.status) params.append('status', filters.status);
        if (filters?.majorArea) params.append('majorArea', filters.majorArea);
        if (filters?.stateOfOrigin) params.append('stateOfOrigin', filters.stateOfOrigin);

        const query = params.toString();
        const url = query ? `/contractors?${query}` : '/contractors';

        this.contractors = await apiFetch<Contractor[]>(url);
        return this.contractors;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch contractors';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchContractorByNo(contractorNo: string) {
      this.loading = true;
      this.error = null;
      try {
        this.currentContractor = await apiFetch<Contractor>(`/contractors/${contractorNo}`);
        return this.currentContractor;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch contractor';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createContractor(input: CreateContractorInput) {
      this.loading = true;
      this.error = null;
      try {
        const contractor = await apiFetch<Contractor>('/contractors', {
          method: 'POST',
          body: input,
        });
        this.contractors = [contractor, ...this.contractors];
        return contractor;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to create contractor';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateContractor(input: UpdateContractorInput) {
      this.loading = true;
      this.error = null;
      try {
        const contractor = await apiFetch<Contractor>(`/contractors/${input.id}`, {
          method: 'PATCH',
          body: input,
        });

        const index = this.contractors.findIndex((c) => c.id === input.id);
        if (index !== -1) {
          this.contractors[index] = contractor;
        }

        if (this.currentContractor?.id === input.id) {
          this.currentContractor = contractor;
        }

        return contractor;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to update contractor';
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
