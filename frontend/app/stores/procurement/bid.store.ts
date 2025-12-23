import { defineStore } from 'pinia';
import { apiFetch } from '~/utils/api-fetch';
import type {
  Bid,
  CreateBidInput,
  UpdateBidInput,
  FilterBidsInput,
  ChangeBidStatusInput,
} from '~/interfaces/procurement/bid.interface';

interface BidState {
  bids: Bid[];
  currentBid: Bid | null;
  loading: boolean;
  error: string | null;
}

export const useBidStore = defineStore('bid', {
  state: (): BidState => ({
    bids: [],
    currentBid: null,
    loading: false,
    error: null,
  }),

  getters: {
    getBidById: (state) => (id: number) => {
      return state.bids.find((b) => b.id === id);
    },

    submittedBids: (state) => {
      return state.bids.filter((b) => b.status === 'submitted');
    },

    awardedBids: (state) => {
      return state.bids.filter((b) => b.status === 'awarded');
    },

    totalBids: (state) => state.bids.length,
  },

  actions: {
    async fetchBidsByProcurement(procurementId: number, filters?: FilterBidsInput) {
      this.loading = true;
      this.error = null;
      try {
        const params = new URLSearchParams();
        if (filters?.search) params.append('search', filters.search);
        if (filters?.status) params.append('status', filters.status);
        if (filters?.contractorNo) params.append('contractorNo', filters.contractorNo);

        const query = params.toString();
        const url = query
          ? `/procurements/${procurementId}/bids?${query}`
          : `/procurements/${procurementId}/bids`;

        this.bids = await apiFetch<Bid[]>(url);
        return this.bids;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch bids';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchBidById(procurementId: number, bidId: number) {
      this.loading = true;
      this.error = null;
      try {
        this.currentBid = await apiFetch<Bid>(`/procurements/${procurementId}/bids/${bidId}`);
        return this.currentBid;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch bid';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async submitBid(procurementId: number, input: FormData) {
      this.loading = true;
      this.error = null;
      try {
        const bid = await apiFetch<Bid>(`/procurements/${procurementId}/bids`, {
          method: 'POST',
          body: input, // fetch handles FormData correctly
        });
        this.bids.unshift(bid);
        return bid;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to submit bid';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchMyBids() {
      this.loading = true;
      this.error = null;
      try {
        const bids = await apiFetch<Bid[]>(`/contractors/me/bids`);
        this.bids = bids;
        return bids;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch your bids';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateBid(procurementId: number, input: UpdateBidInput) {
      this.loading = true;
      this.error = null;
      try {
        const bid = await apiFetch<Bid>(`/procurements/${procurementId}/bids/${input.id}`, {
          method: 'PATCH',
          body: input,
        });

        const index = this.bids.findIndex((b) => b.id === input.id);
        if (index !== -1) {
          this.bids[index] = bid;
        }

        if (this.currentBid?.id === input.id) {
          this.currentBid = bid;
        }

        return bid;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to update bid';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async withdrawBid(procurementId: number, bidId: number) {
      this.loading = true;
      this.error = null;
      try {
        const bid = await apiFetch<Bid>(`/procurements/${procurementId}/bids/${bidId}/withdraw`, {
          method: 'POST',
        });

        const index = this.bids.findIndex((b) => b.id === bidId);
        if (index !== -1) {
          this.bids[index] = bid;
        }

        if (this.currentBid?.id === bidId) {
          this.currentBid = bid;
        }

        return bid;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to withdraw bid';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async changeBidStatus(procurementId: number, bidId: number, input: ChangeBidStatusInput) {
      this.loading = true;
      this.error = null;
      try {
        const bid = await apiFetch<Bid>(`/procurements/${procurementId}/bids/${bidId}/status`, {
          method: 'PATCH',
          body: input,
        });

        const index = this.bids.findIndex((b) => b.id === bidId);
        if (index !== -1) {
          this.bids[index] = bid;
        }

        if (this.currentBid?.id === bidId) {
          this.currentBid = bid;
        }

        return bid;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to change bid status';
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
