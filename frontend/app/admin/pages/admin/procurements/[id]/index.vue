<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="procurementStore.loading && !procurement" class="text-center py-12">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary-500" />
      <p class="mt-2 text-gray-600">Loading procurement details...</p>
    </div>

    <!-- Content -->
    <div v-else-if="procurement" class="space-y-6">
      <!-- Header -->
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-3">
          <UButton
            icon="i-lucide-arrow-left"
            color="gray"
            variant="ghost"
            to="/admin/procurements"
          />
          <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ procurement.title }}
            </h2>
            <p class="text-sm text-gray-500 mt-1">{{ procurement.referenceNo }}</p>
          </div>
        </div>
        <UBadge :color="getStatusColor(procurement.status)" variant="subtle" size="lg">
          {{ procurement.status }}
        </UBadge>
      </div>

      <!-- Actions & Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <UCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Bids</p>
              <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {{ procurement.bids?.length || 0 }}
              </p>
            </div>
            <UIcon name="i-lucide-users" class="w-8 h-8 text-primary-500 opacity-80" />
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Documents</p>
              <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {{ procurement.documents?.length || 0 }}
              </p>
            </div>
            <UIcon name="i-lucide-file-text" class="w-8 h-8 text-blue-500 opacity-80" />
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Days Left</p>
              <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {{ getRemainingDays(procurement.submissionDeadline) }}
              </p>
            </div>
            <UIcon name="i-lucide-calendar" class="w-8 h-8 text-orange-500 opacity-80" />
          </div>
        </UCard>

        <UCard>
          <div class="flex flex-col gap-2">
            <UButton
              icon="i-lucide-edit"
              color="primary"
              variant="solid"
              size="sm"
              block
              @click="isEditing = true"
            >
              Edit
            </UButton>
            <UButton
              :icon="statusAction?.icon || 'i-lucide-loader-2'"
              :color="statusAction?.color || 'gray'"
              :variant="statusAction?.nextStatus ? 'solid' : 'outline'"
              size="sm"
              block
              :loading="statusChanging"
              :disabled="!statusAction?.nextStatus"
              @click="handleStatusAction"
            >
              {{ statusAction?.label || 'Status Locked' }}
            </UButton>
          </div>
        </UCard>
      </div>

      <!-- Details Tabs -->
      <UTabs :items="tabs" v-model:selected="selectedTab" default-value="overview">
        <!-- Overview Tab -->
        <template #overview>
          <div class="space-y-4 py-4">
            <UCard>
              <template #header>
                <h3 class="text-lg font-semibold">Basic Information</h3>
              </template>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm font-medium text-gray-500">Category</p>
                  <p class="mt-1 text-gray-900 dark:text-white">{{ procurement.category }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Type</p>
                  <p class="mt-1 text-gray-900 dark:text-white">{{ procurement.type }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Location</p>
                  <p class="mt-1 text-gray-900 dark:text-white">{{ procurement.location }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Budget Estimate</p>
                  <p class="mt-1 text-gray-900 dark:text-white">
                    {{
                      procurement.budgetEstimate
                        ? `₦${procurement.budgetEstimate.toLocaleString()}`
                        : 'N/A'
                    }}
                  </p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Publish Date</p>
                  <p class="mt-1 text-gray-900 dark:text-white">
                    {{ formatDate(procurement.publishDate) }}
                  </p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Submission Deadline</p>
                  <p class="mt-1 text-gray-900 dark:text-white">
                    {{ formatDate(procurement.submissionDeadline) }}
                  </p>
                </div>
              </div>
            </UCard>

            <UCard>
              <template #header>
                <h3 class="text-lg font-semibold">Description</h3>
              </template>
              <div class="prose dark:prose-invert max-w-none" v-html="procurement.description" />
            </UCard>

            <UCard v-if="procurement.eligibilityCriteria">
              <template #header>
                <h3 class="text-lg font-semibold">Eligibility Criteria</h3>
              </template>
              <div
                class="prose dark:prose-invert max-w-none"
                v-html="procurement.eligibilityCriteria"
              />
            </UCard>
          </div>
        </template>

        <!-- Bids Tab -->
        <template #bids>
          <div class="py-4">
            <UCard>
              <template #header>
                <div class="flex items-center justify-between">
                  <h3 class="text-lg font-semibold">Bids ({{ procurement.bids?.length || 0 }})</h3>
                  <UButton
                    icon="i-lucide-download"
                    color="primary"
                    variant="ghost"
                    size="sm"
                    @click="exportBids"
                  >
                    Export
                  </UButton>
                </div>
              </template>

              <UTable
                v-if="procurement.bids && procurement.bids.length > 0"
                :data="procurement.bids"
                :columns="bidColumns"
              >
                <template #contractorNo-cell="{ row }">
                  <span class="font-mono text-sm">{{ row.original?.contractorNo }}</span>
                </template>

                <template #status-cell="{ row }">
                  <UBadge :color="getBidStatusColor(row.original.status)" variant="subtle">
                    {{ row.original.status }}
                  </UBadge>
                </template>

                <template #price-cell="{ row }">
                  {{ row.original.price ? `₦${row.original.price.toLocaleString()}` : 'N/A' }}
                </template>

                <template #submittedAt-cell="{ row }">
                  {{ formatDate(row.original.submittedAt) }}
                </template>

                <template #actions-cell="{ row }">
                  <UButton
                    icon="i-lucide-eye"
                    color="primary"
                    variant="ghost"
                    size="xs"
                    @click="viewBid(row.original)"
                  />
                </template>
              </UTable>

              <div v-else class="text-center py-8 text-gray-500">No bids submitted yet</div>
            </UCard>
          </div>
        </template>

        <!-- Documents Tab -->
        <template #documents>
          <div class="py-4 space-y-4">
            <UCard>
              <template #header>
                <div class="flex items-center justify-between">
                  <h3 class="text-lg font-semibold">Documents</h3>
                  <UButton
                    icon="i-lucide-upload"
                    color="primary"
                    variant="solid"
                    size="sm"
                    @click="showUploadModal = true"
                  >
                    Upload Document
                  </UButton>
                </div>
              </template>

              <div
                v-if="procurement.documents && procurement.documents.length > 0"
                class="space-y-2"
              >
                <div
                  v-for="doc in procurement.documents"
                  :key="doc.id"
                  class="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div class="flex items-center gap-3">
                    <UIcon name="i-lucide-file" class="w-5 h-5 text-gray-500" />
                    <div>
                      <p class="font-medium">{{ doc.name }}</p>
                      <p class="text-sm text-gray-500">{{ formatFileSize(doc.size) }}</p>
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <UButton
                      icon="i-lucide-download"
                      color="gray"
                      variant="ghost"
                      size="xs"
                      :href="doc.url"
                      target="_blank"
                    />
                    <UButton
                      icon="i-lucide-trash"
                      color="red"
                      variant="ghost"
                      size="xs"
                      @click="deleteDocument(doc.id)"
                    />
                  </div>
                </div>
              </div>

              <div v-else class="text-center py-8 text-gray-500">No documents uploaded yet</div>
            </UCard>
          </div>
        </template>

        <!-- Evaluation Tab -->
        <template #evaluation>
          <div class="py-4 space-y-4">
            <UCard>
              <template #header>
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-lg font-semibold">Bid Evaluation</h3>
                    <p class="text-sm text-gray-500">Compare bids and award a winner</p>
                  </div>
                  <div class="flex items-center gap-2 text-sm text-gray-500">
                    <span class="font-semibold">Best Price:</span>
                    <span>
                      {{ bestBidDisplay }}
                    </span>
                  </div>
                </div>
              </template>

              <UTable
                v-if="procurement.bids && procurement.bids.length"
                :data="evaluationRows"
                :columns="evaluationColumns"
              >
                <template #contractor-cell="{ row }">
                  <div>
                    <p class="font-semibold">
                      {{ row.original.contractor?.companyName || row.original.contractorNo }}
                    </p>
                    <p class="text-xs text-gray-500">{{ row.original.contractorNo }}</p>
                  </div>
                </template>

                <template #amount-cell="{ row }">
                  <span class="font-mono">{{
                    formatCurrency(row.original.price || row.original.amount)
                  }}</span>
                </template>

                <template #status-cell="{ row }">
                  <UBadge :color="getBidStatusColor(row.original.status)" variant="subtle">
                    {{ row.original.status.replace('_', ' ') }}
                  </UBadge>
                </template>

                <template #proposal-cell="{ row }">
                  <div class="flex gap-2">
                    <UButton
                      v-if="row.original.technicalProposalUrl"
                      icon="i-lucide-download"
                      color="primary"
                      variant="ghost"
                      size="xs"
                      :href="row.original.technicalProposalUrl"
                      target="_blank"
                    />
                    <UButton
                      v-if="row.original.commercialProposalUrl"
                      icon="i-lucide-file-text"
                      color="blue"
                      variant="ghost"
                      size="xs"
                      :href="row.original.commercialProposalUrl"
                      target="_blank"
                    />
                  </div>
                </template>

                <template #actions-cell="{ row }">
                  <div class="flex gap-2">
                    <UButton
                      color="primary"
                      size="xs"
                      variant="outline"
                      icon="i-lucide-award"
                      :loading="awardingBidId === row.original.id"
                      :disabled="row.original.status === 'awarded'"
                      @click="awardBid(row.original.id)"
                    >
                      Award
                    </UButton>
                    <UButton
                      color="gray"
                      size="xs"
                      variant="ghost"
                      icon="i-lucide-eye"
                      @click="viewBid(row.original)"
                    />
                  </div>
                </template>
              </UTable>

              <div v-else class="text-center py-10 text-gray-500">No bids to evaluate</div>
            </UCard>
          </div>
        </template>
      </UTabs>
    </div>

    <!-- Edit Modal -->
    <UModal v-model:open="isEditing" fullscreen size="xl">
      <template #header>
        <div class="flex justify-between w-full">
          <h3 class="text-lg font-semibold">Edit Procurement</h3>

          <UButton
            icon="i-lucide-x"
            color="gray"
            variant="ghost"
            class="ml-auto"
            @click="isEditing = false"
          />
        </div>
      </template>

      <template #body>
        <UForm :state="editForm" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField label="Reference Number" help="Locked after creation">
              <UInput v-model="editForm.referenceNo" disabled />
            </UFormField>

            <UFormField label="Title" required>
              <UInput v-model="editForm.title" />
            </UFormField>

            <UFormField label="Category" required>
              <USelectMenu
                v-model="editForm.category"
                :items="categoryOptions"
                value-key="value"
                placeholder="Select category"
              />
            </UFormField>

            <UFormField label="Type" required>
              <USelectMenu
                v-model="editForm.type"
                :items="typeOptions"
                value-key="value"
                placeholder="Select type"
              />
            </UFormField>

            <UFormField label="Location" required>
              <UInput v-model="editForm.location" />
            </UFormField>

            <UFormField label="Budget Estimate">
              <UInput
                v-model.number="editForm.budgetEstimate"
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </UFormField>
          </div>

          <UFormField label="Description / Scope" required>
            <UEditor
              v-slot="{ editor }"
              v-model="editForm.description"
              :ui="{ base: 'min-h-50 prose prose-sm max-w-none' }"
            >
              <UEditorToolbar :editor="editor" :items="editorToolbarItems" layout="fixed" />
            </UEditor>
          </UFormField>

          <UFormField label="Eligibility Criteria">
            <UTextarea
              v-model="editForm.eligibilityCriteria"
              :rows="3"
              placeholder="Enter eligibility criteria for bidders"
            />
          </UFormField>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField label="Publish Date">
              <UInput v-model="editForm.publishDate" type="datetime-local" />
            </UFormField>

            <UFormField label="Submission Deadline" required>
              <UInput v-model="editForm.submissionDeadline" type="datetime-local" />
            </UFormField>

            <UFormField label="Pre-Bid Meeting Date">
              <UInput v-model="editForm.preBidMeetingDate" type="datetime-local" />
            </UFormField>

            <UFormField label="Pre-Bid Meeting Location">
              <UInput
                v-model="editForm.preBidMeetingLocation"
                placeholder="Enter meeting location"
              />
            </UFormField>
          </div>

          <UFormField label="Pre-Bid Meeting Notes">
            <UTextarea
              v-model="editForm.preBidNotes"
              :rows="3"
              placeholder="Enter pre-bid meeting notes"
            />
          </UFormField>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField label="Contact Email">
              <UInput
                v-model="editForm.contactEmail"
                type="email"
                placeholder="contact@example.com"
              />
            </UFormField>

            <UFormField label="Contact Phone">
              <UInput v-model="editForm.contactPhone" type="tel" placeholder="+234 800 000 0000" />
            </UFormField>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField label="Tags (comma-separated)">
              <UInput v-model="editTagsInput" placeholder="construction, renovation, urgent" />
            </UFormField>

            <UFormField label="Status">
              <USelectMenu
                v-model="editForm.status"
                :items="statusOptions"
                value-key="value"
                placeholder="Select status"
              />
            </UFormField>
          </div>
        </UForm>
      </template>

      <template #footer>
        <div class="flex gap-2 justify-end">
          <UButton color="gray" variant="ghost" @click="isEditing = false"> Cancel </UButton>
          <UButton color="primary" :loading="procurementStore.loading" @click="handleUpdate">
            Save Changes
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- Upload Document Modal -->
    <UModal v-model:open="showUploadModal">
      <template #header>
        <h3 class="text-lg font-semibold">Upload Document</h3>
      </template>

      <template #body>
        <div class="space-y-4">
          <UFormField label="Document Name" required>
            <UInput v-model="uploadForm.name" placeholder="Enter document name" />
          </UFormField>

          <UFormField label="Document File" required>
            <div class="space-y-2">
              <input ref="fileInputRef" type="file" class="hidden" @change="handleFileChange" />
              <div class="flex items-center gap-3">
                <UButton
                  icon="i-lucide-upload"
                  variant="outline"
                  color="primary"
                  @click="triggerFileDialog"
                >
                  Choose File
                </UButton>
                <div class="text-sm text-gray-600 dark:text-gray-300">
                  <p class="font-medium" v-if="selectedFile">{{ selectedFile.name }}</p>
                  <p class="font-medium" v-else>No file selected</p>
                  <p v-if="selectedFile" class="text-xs text-gray-500">
                    {{ formatFileSize(selectedFile.size) }}
                  </p>
                </div>
              </div>
            </div>
          </UFormField>
        </div>
      </template>

      <template #footer>
        <div class="flex gap-2 justify-end">
          <UButton color="gray" variant="ghost" @click="showUploadModal = false"> Cancel </UButton>
          <UButton color="primary" :loading="uploadingDocument" @click="handleUploadDocument">
            Upload
          </UButton>
        </div>
      </template>
    </UModal>
  </div>

  <!-- Bid Detail Modal -->
  <UModal v-model:open="showBidDetailModal" size="lg">
    <template #header>
      <h3 class="text-lg font-semibold">Bid Details</h3>
    </template>

    <template #body>
      <div v-if="selectedBid" class="space-y-4">
        <!-- Contractor Information -->
        <UCard>
          <template #header>
            <h4 class="font-semibold">Contractor Information</h4>
          </template>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm font-medium text-gray-500">Contractor Number</p>
              <p class="mt-1 text-gray-900 dark:text-white font-mono">
                {{ selectedBid.contractorNo }}
              </p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">Contact Person</p>
              <p class="mt-1 text-gray-900 dark:text-white">{{ selectedBid.contactName }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">Email</p>
              <p class="mt-1 text-gray-900 dark:text-white">{{ selectedBid.contactEmail }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">Phone</p>
              <p class="mt-1 text-gray-900 dark:text-white">{{ selectedBid.contactPhone }}</p>
            </div>
          </div>
        </UCard>

        <!-- Bid Details -->
        <UCard>
          <template #header>
            <h4 class="font-semibold">Bid Details</h4>
          </template>
          <div class="space-y-3">
            <div>
              <p class="text-sm font-medium text-gray-500">Bid Price</p>
              <p class="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
                {{ selectedBid.price ? `₦${selectedBid.price.toLocaleString()}` : 'N/A' }}
              </p>
            </div>

            <div>
              <p class="text-sm font-medium text-gray-500">Current Status</p>
              <UBadge :color="getBidStatusColor(selectedBid.status)" variant="subtle" class="mt-1">
                {{ selectedBid.status.replace('_', ' ') }}
              </UBadge>
            </div>

            <div>
              <p class="text-sm font-medium text-gray-500">Submitted At</p>
              <p class="mt-1 text-gray-900 dark:text-white">
                {{ formatDate(selectedBid.submittedAt) }}
              </p>
            </div>

            <div v-if="selectedBid.notes">
              <p class="text-sm font-medium text-gray-500">Notes</p>
              <p class="mt-1 text-gray-900 dark:text-white">{{ selectedBid.notes }}</p>
            </div>
          </div>
        </UCard>

        <!-- Documents -->
        <UCard>
          <template #header>
            <h4 class="font-semibold">Proposal Documents</h4>
          </template>
          <div class="space-y-2">
            <div
              v-if="selectedBid.technicalProposalUrl"
              class="flex items-center justify-between p-3 rounded-lg border"
            >
              <div class="flex items-center gap-3">
                <UIcon name="i-lucide-file" class="w-5 h-5 text-gray-500" />
                <span class="font-medium">Technical Proposal</span>
              </div>
              <UButton
                icon="i-lucide-download"
                color="primary"
                variant="ghost"
                size="xs"
                :href="selectedBid.technicalProposalUrl"
                target="_blank"
              >
                Download
              </UButton>
            </div>

            <div
              v-if="selectedBid.commercialProposalUrl"
              class="flex items-center justify-between p-3 rounded-lg border"
            >
              <div class="flex items-center gap-3">
                <UIcon name="i-lucide-file" class="w-5 h-5 text-gray-500" />
                <span class="font-medium">Commercial Proposal</span>
              </div>
              <UButton
                icon="i-lucide-download"
                color="primary"
                variant="ghost"
                size="xs"
                :href="selectedBid.commercialProposalUrl"
                target="_blank"
              >
                Download
              </UButton>
            </div>

            <div
              v-if="!selectedBid.technicalProposalUrl && !selectedBid.commercialProposalUrl"
              class="text-center py-4 text-gray-500"
            >
              No documents uploaded
            </div>
          </div>
        </UCard>

        <!-- Status Update -->
        <UCard>
          <template #header>
            <h4 class="font-semibold">Update Status</h4>
          </template>
          <div class="space-y-3">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Change the status of this bid to reflect the evaluation progress.
            </p>
            <div class="grid grid-cols-2 gap-2">
              <UButton
                v-for="option in bidStatusOptions"
                :key="option.value"
                :color="selectedBid.status === option.value ? 'primary' : 'gray'"
                :variant="selectedBid.status === option.value ? 'solid' : 'outline'"
                size="sm"
                :loading="updatingBidStatus"
                :disabled="selectedBid.status === option.value"
                @click="updateBidStatus(selectedBid.id, option.value)"
              >
                {{ option.label }}
              </UButton>
            </div>
          </div>
        </UCard>
      </div>
    </template>

    <template #footer>
      <div class="flex gap-2 justify-end">
        <UButton color="gray" variant="ghost" @click="showBidDetailModal = false">Close</UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import type { TableColumn, TabsItem } from '@nuxt/ui';
import { useProcurementStore } from '~/stores/procurement/procurement.store';
import { BidStatus, type Bid } from '~/interfaces/procurement/bid.interface';
import {
  ProcurementStatus,
  type UploadDocumentInput,
  type Procurement,
  type UpdateProcurementInput,
} from '~/interfaces/procurement/procurement.interface';
import { editorToolbarItems } from '~/utils/toolbar-items';
import { apiFetch } from '~/utils/api-fetch';

const route = useRoute();
const router = useRouter();
const procurementStore = useProcurementStore();
const toast = useToast();

const procurementId = computed(() => parseInt(route.params.id as string, 10));
const procurement = computed(() => procurementStore.currentProcurement);
// const selectedTab = ref<'overview' | 'bids' | 'documents'>('overview');
const isEditing = ref(false);
const showUploadModal = ref(false);

const selectedTab = computed({
  get: () => (route.query?.tab as string) || 'overview',
  set: (tab) => router.push({ query: { tab } }),
});

const tabs: TabsItem[] = [
  { label: 'Overview', value: 'overview', icon: 'i-lucide-info', slot: 'overview' },
  { label: 'Bids', value: 'bids', icon: 'i-lucide-users', slot: 'bids' },
  { label: 'Documents', value: 'documents', icon: 'i-lucide-file-text', slot: 'documents' },
  { label: 'Evaluation', value: 'evaluation', icon: 'i-lucide-scale', slot: 'evaluation' },
];

const bidColumns: TableColumn<Bid>[] = [
  { accessorKey: 'contractorNo', header: 'Contractor #' },
  { accessorKey: 'contactName', header: 'Contact' },
  { accessorKey: 'contactEmail', header: 'Email' },
  { accessorKey: 'price', header: 'Price' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'submittedAt', header: 'Submitted' },
  { accessorKey: 'actions', header: 'Actions' },
];

const evaluationColumns: TableColumn<Bid>[] = [
  { accessorKey: 'contractor', header: 'Contractor' },
  { accessorKey: 'amount', header: 'Amount' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'proposal', header: 'Proposals' },
  { accessorKey: 'actions', header: 'Actions' },
];

const categoryOptions = [
  { label: 'Construction', value: 'Construction' },
  { label: 'IT Services', value: 'IT Services' },
  { label: 'Consulting', value: 'Consulting' },
  { label: 'Equipment', value: 'Equipment' },
  { label: 'Maintenance', value: 'Maintenance' },
  { label: 'Other', value: 'Other' },
];

const typeOptions = [
  { label: 'Open Tender', value: 'Open Tender' },
  { label: 'Restricted Tender', value: 'Restricted Tender' },
  { label: 'Request for Proposal (RFP)', value: 'Request for Proposal (RFP)' },
  { label: 'Request for Quotation (RFQ)', value: 'Request for Quotation (RFQ)' },
];

type EditFormState = {
  referenceNo?: string;
  title: string;
  category: string;
  type: string;
  location: string;
  budgetEstimate?: number;
  description: string;
  eligibilityCriteria?: string;
  submissionDeadline: string;
  publishDate?: string;
  preBidMeetingDate?: string;
  preBidMeetingLocation?: string;
  preBidNotes?: string;
  tags: string[];
  contactEmail?: string;
  contactPhone?: string;
  status: ProcurementStatus;
};

const editForm = reactive<EditFormState>({
  referenceNo: '',
  title: '',
  category: '',
  type: '',
  location: '',
  budgetEstimate: undefined,
  description: '',
  eligibilityCriteria: '',
  submissionDeadline: '',
  publishDate: '',
  preBidMeetingDate: '',
  preBidMeetingLocation: '',
  preBidNotes: '',
  tags: [],
  contactEmail: '',
  contactPhone: '',
  status: ProcurementStatus.DRAFT as ProcurementStatus,
});

const editTagsInput = ref('');

const statusOptions = [
  { label: 'Draft', value: ProcurementStatus.DRAFT },
  { label: 'Published', value: ProcurementStatus.PUBLISHED },
  { label: 'Closed', value: ProcurementStatus.CLOSED },
  { label: 'Awarded', value: ProcurementStatus.AWARDED },
  { label: 'Archived', value: ProcurementStatus.ARCHIVED },
];

const statusChanging = ref(false);
const statusAction = computed(() => {
  const status = procurement.value?.status;
  if (!status) return null;

  if (status === ProcurementStatus.DRAFT) {
    return {
      label: 'Publish',
      nextStatus: ProcurementStatus.PUBLISHED,
      color: 'green',
      icon: 'i-lucide-rocket',
    } as const;
  }

  if (status === ProcurementStatus.PUBLISHED) {
    return {
      label: 'Close',
      nextStatus: ProcurementStatus.CLOSED,
      color: 'orange',
      icon: 'i-lucide-lock',
    } as const;
  }

  return {
    label: 'Status Locked',
    nextStatus: null,
    color: 'gray',
    icon: 'i-lucide-check',
  } as const;
});

const handleStatusAction = () => {
  if (!statusAction.value?.nextStatus) return;
  updateStatus(statusAction.value.nextStatus);
};

const uploadForm = reactive<UploadDocumentInput>({
  name: '',
  url: '',
  mimeType: undefined,
  size: undefined,
});

const selectedFile = ref<File | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const uploadingDocument = ref(false);

const formatDate = (dateString?: string) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getRemainingDays = (deadlineString?: string) => {
  if (!deadlineString) return 0;
  const deadline = new Date(deadlineString);
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const getStatusColor = (status: ProcurementStatus | string) => {
  const colors: Record<string, 'gray' | 'success' | 'orange' | 'blue' | 'error'> = {
    draft: 'gray',
    published: 'success',
    closed: 'orange',
    awarded: 'blue',
    archived: 'error',
  };
  return colors[status] || 'gray';
};

const getBidStatusColor = (status: string) => {
  const colors: Record<string, 'gray' | 'success' | 'orange' | 'blue' | 'error' | 'yellow'> = {
    submitted: 'blue',
    under_review: 'yellow',
    accepted: 'success',
    rejected: 'error',
    withdrawn: 'gray',
    awarded: 'success',
  };
  return colors[status] || 'gray';
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return 'Unknown size';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatCurrency = (value?: number) => {
  if (!value && value !== 0) return 'N/A';
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(value);
};

const formatDateTimeLocal = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  const pad = (num: number) => num.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const parseTags = (value: string) =>
  value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

const populateEditForm = (data: Procurement) => {
  editForm.referenceNo = data.referenceNo || '';
  editForm.title = data.title || '';
  editForm.category = data.category || '';
  editForm.type = data.type || '';
  editForm.location = data.location || '';
  editForm.budgetEstimate = data.budgetEstimate;
  editForm.description = data.description || '';
  editForm.eligibilityCriteria = data.eligibilityCriteria || '';
  editForm.submissionDeadline = formatDateTimeLocal(data.submissionDeadline);
  editForm.publishDate = formatDateTimeLocal(data.publishDate);
  editForm.preBidMeetingDate = formatDateTimeLocal(data.preBidMeetingDate);
  editForm.preBidMeetingLocation = data.preBidMeetingLocation || '';
  editForm.preBidNotes = data.preBidNotes || '';
  editForm.tags = data.tags || [];
  editForm.contactEmail = data.contactEmail || '';
  editForm.contactPhone = data.contactPhone || '';
  editForm.status = data.status;
  editTagsInput.value = data.tags?.join(', ') || '';
};

const triggerFileDialog = () => fileInputRef.value?.click();

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  selectedFile.value = file || null;

  if (file && !uploadForm.name) {
    uploadForm.name = file.name.replace(/\.[^/.]+$/, '');
  }
};

const uploadDocumentFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiFetch<{ url: string; mimeType?: string; size?: number }>('/upload', {
    method: 'POST',
    body: formData,
  });
};

const awardBid = async (bidId: number) => {
  awardingBidId.value = bidId;
  try {
    // Lazy-load bid store to avoid heavy initial bundle
    const { useBidStore } = await import('~/stores/procurement/bid.store');
    const bidStore = useBidStore();

    await bidStore.changeBidStatus(procurementId.value, bidId, { status: BidStatus.AWARDED });
    await procurementStore.fetchProcurementById(procurementId.value);

    toast.add({
      title: 'Bid awarded',
      description: 'The bid has been marked as awarded.',
      color: 'success',
    });
  } catch (error) {
    console.error(error);
    toast.add({
      title: 'Error',
      description: 'Failed to award bid',
      color: 'error',
    });
  } finally {
    awardingBidId.value = null;
  }
};

const resetUploadForm = () => {
  uploadForm.name = '';
  uploadForm.url = '';
  uploadForm.mimeType = undefined;
  uploadForm.size = undefined;
  selectedFile.value = null;
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

const updateStatus = async (status: ProcurementStatus) => {
  statusChanging.value = true;
  try {
    await procurementStore.updateProcurementStatus(procurementId.value, status);
    toast.add({
      title: 'Success',
      description: `Status updated to ${status}`,
      color: 'success',
    });
  } catch (error) {
    console.error(error);
    toast.add({
      title: 'Error',
      description: 'Failed to update procurement status',
      color: 'error',
    });
  } finally {
    statusChanging.value = false;
  }
};

const handleUpdate = async () => {
  try {
    const payload: UpdateProcurementInput = {
      id: procurementId.value,
      title: editForm.title,
      category: editForm.category,
      type: editForm.type,
      location: editForm.location,
      description: editForm.description,
      eligibilityCriteria: editForm.eligibilityCriteria,
      submissionDeadline: editForm.submissionDeadline
        ? new Date(editForm.submissionDeadline)
        : undefined,
      publishDate: editForm.publishDate ? new Date(editForm.publishDate) : undefined,
      budgetEstimate: editForm.budgetEstimate,
      preBidMeetingDate: editForm.preBidMeetingDate
        ? new Date(editForm.preBidMeetingDate)
        : undefined,
      preBidMeetingLocation: editForm.preBidMeetingLocation,
      preBidNotes: editForm.preBidNotes,
      tags: parseTags(editTagsInput.value),
      contactEmail: editForm.contactEmail,
      contactPhone: editForm.contactPhone,
      status: editForm.status,
    };

    await procurementStore.updateProcurement(payload);
    toast.add({
      title: 'Success',
      description: 'Procurement updated successfully',
      color: 'success',
    });
    isEditing.value = false;
  } catch (error) {
    console.error(error);
    toast.add({
      title: 'Error',
      description: 'Failed to update procurement',
      color: 'error',
    });
  }
};

const handleUploadDocument = async () => {
  if (!uploadForm.name.trim()) {
    toast.add({
      title: 'Missing name',
      description: 'Please add a document name',
      color: 'orange',
    });
    return;
  }

  if (!selectedFile.value) {
    toast.add({
      title: 'No file selected',
      description: 'Choose a file to upload',
      color: 'orange',
    });
    return;
  }

  uploadingDocument.value = true;
  try {
    const uploadResponse = await uploadDocumentFile(selectedFile.value);
    const payload: UploadDocumentInput = {
      name: uploadForm.name.trim(),
      url: uploadResponse.url,
      mimeType: uploadResponse.mimeType || selectedFile.value.type,
      size: uploadResponse.size ?? selectedFile.value.size,
    };

    await procurementStore.uploadDocument(procurementId.value, payload);
    toast.add({
      title: 'Success',
      description: 'Document uploaded successfully',
      color: 'success',
    });
    showUploadModal.value = false;
    resetUploadForm();
  } catch (error) {
    console.error(error);
    toast.add({
      title: 'Error',
      description: 'Failed to upload document',
      color: 'error',
    });
  } finally {
    uploadingDocument.value = false;
  }
};

const deleteDocument = async (documentId: number) => {
  try {
    await procurementStore.deleteDocument(documentId);
    toast.add({
      title: 'Success',
      description: 'Document deleted successfully',
      color: 'success',
    });
  } catch (error) {
    console.error(error);
    toast.add({
      title: 'Error',
      description: 'Failed to delete document',
      color: 'error',
    });
  }
};

const viewBid = (bid: Bid) => {
  selectedBid.value = bid;
  showBidDetailModal.value = true;
};

const exportBids = () => {
  // Export bids to CSV
  if (!procurement.value?.bids || procurement.value.bids.length === 0) {
    toast.add({
      title: 'Warning',
      description: 'No bids to export',
      color: 'orange',
    });
    return;
  }

  // Create CSV content
  const headers = [
    'Contractor No',
    'Contact Name',
    'Email',
    'Phone',
    'Price',
    'Status',
    'Submitted At',
  ];
  const rows = procurement.value.bids.map((bid) => [
    bid.contractorNo,
    bid.contactName,
    bid.contactEmail,
    bid.contactPhone,
    bid.price || 'N/A',
    bid.status,
    formatDate(bid.submittedAt),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  // Download
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bids-${procurement.value.referenceNo}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};

const selectedBid = ref<Bid | null>(null);
const showBidDetailModal = ref(false);
const updatingBidStatus = ref(false);

const bidStatusOptions: { label: string; value: BidStatus }[] = [
  { label: 'Submitted', value: BidStatus.SUBMITTED },
  { label: 'Under Review', value: BidStatus.UNDER_REVIEW },
  { label: 'Accepted', value: BidStatus.ACCEPTED },
  { label: 'Rejected', value: BidStatus.REJECTED },
  { label: 'Awarded', value: BidStatus.AWARDED },
];

const awardingBidId = ref<number | null>(null);

const evaluationRows = computed(() => {
  if (!procurement.value?.bids) return [] as Bid[];
  return [...procurement.value.bids].sort(
    (a, b) => (a.price || a.amount || 0) - (b.price || b.amount || 0),
  );
});

const bestBidDisplay = computed(() => {
  if (!evaluationRows.value.length) return '—';
  const [top] = evaluationRows.value;
  if (!top) return '—';
  return `${formatCurrency(top.price || top.amount)} • ${top.contractor?.companyName || top.contractorNo}`;
});

const updateBidStatus = async (bidId: number, status: BidStatus) => {
  updatingBidStatus.value = true;
  try {
    // Import bid store
    const { useBidStore } = await import('~/stores/procurement/bid.store');
    const bidStore = useBidStore();

    await bidStore.changeBidStatus(procurementId.value, bidId, {
      status,
    });

    toast.add({
      title: 'Success',
      description: `Bid status updated to ${status.replace('_', ' ')}`,
      color: 'success',
    });

    // Refresh procurement data
    await procurementStore.fetchProcurementById(procurementId.value);
    showBidDetailModal.value = false;
  } catch (error) {
    console.error(error);
    toast.add({
      title: 'Error',
      description: 'Failed to update bid status',
      color: 'error',
    });
  } finally {
    updatingBidStatus.value = false;
  }
};

watch(procurement, (value) => {
  if (value) {
    populateEditForm(value);
  }
});

onMounted(async () => {
  try {
    await procurementStore.fetchProcurementById(procurementId.value);
    if (procurement.value) {
      populateEditForm(procurement.value);
    }
  } catch (error) {
    console.error(error);
    toast.add({
      title: 'Error',
      description: 'Failed to load procurement details',
      color: 'error',
    });
  }
});
</script>
