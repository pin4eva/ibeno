<script setup lang="ts">
useHead({
  title: 'Home - IBENO',
  meta: [{ name: 'description', content: 'Welcome to the IBENO System' }],
});
</script>

<template>
  <div>
    <!-- Hero Section -->
    <div class="bg-primary-700 py-24">
      <UContainer>
        <div class="grid md:grid-cols-2 gap-12 items-center">
          <div class="space-y-6">
            <h1 class="text-5xl font-bold text-white leading-tight">
              Nurturing the<br />
              Heart of our<br />
              Community
            </h1>
            <p class="text-xl text-white/90 font-light">
              We empower people and transform their lives by investing in their future
            </p>
            <div>
              <UButton
                to="/programs"
                size="xl"
                color="white"
                variant="solid"
                class="text-primary-700 py-4 font-semibold rounded-tl-none rounded-br-none rounded-tr-3xl rounded-bl-3xl px-8"
              >
                Explore Programs
              </UButton>
            </div>
          </div>
          <div class="hidden md:block">
            <img
              src="/assets/images/hero-img.png"
              alt="People holding wooden logs"
              class="w-full h-auto object-cover rounded-lg shadow-xl"
            />
          </div>
        </div>
      </UContainer>
    </div>

    <!-- Mission & Vision Section -->
    <div class="py-20 bg-primary-50/50 dark:bg-gray-900">
      <UContainer>
        <div class="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <img
              src="/assets/images/section2-i.png"
              alt="man smiling"
              class="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
          <div class="space-y-8">
            <div class="space-y-4">
              <h3 class="text-3xl font-bold text-gray-900 dark:text-white">Our Mission</h3>
              <p class="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                To ensure that Trust funds are managed and utilized responsibly, and channeled into
                sustainable infrastructural and developmental projects to benefit all communities in
                Ibeno LGA.
              </p>
            </div>

            <div class="space-y-4">
              <h3 class="text-3xl font-bold text-gray-900 dark:text-white">Our Vision</h3>
              <p class="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                To make Ibeno a flourishing community where all its sections of Ibeno community
                achieve economic growth, access opportunities and attain their potentials.
              </p>
            </div>

            <UButton
              to="/auth/signup"
              size="xl"
              color="primary"
              class="rounded-tl-none rounded-br-none rounded-tr-3xl rounded-bl-3xl px-12"
            >
              Join Us
            </UButton>
          </div>
        </div>
      </UContainer>
    </div>

    <!-- Programs Section -->
    <div class="py-20 bg-white dark:bg-gray-950">
      <UContainer>
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Development Trust Programs and Supports
          </h2>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Education Card -->
          <NuxtLink
            to="/programs"
            class="group block bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-800 overflow-hidden"
          >
            <div class="aspect-video overflow-hidden">
              <img
                src="/assets/images/scholar.jpg"
                alt="Education"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div class="p-6">
              <span class="text-primary-600 font-semibold text-sm uppercase tracking-wider"
                >Education</span
              >
              <p class="mt-2 text-xl font-medium text-gray-900 dark:text-white">
                Keep Your Dreams Alive!
              </p>
            </div>
          </NuxtLink>

          <!-- Medical Mission Card -->
          <NuxtLink
            to="/programs"
            class="group block bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-800 overflow-hidden"
          >
            <div class="aspect-video overflow-hidden">
              <img
                src="/assets/images/medical-outreach.jpeg"
                alt="Medical Mission"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div class="p-6">
              <span class="text-primary-600 font-semibold text-sm uppercase tracking-wider"
                >Medical Mission</span
              >
              <p class="mt-2 text-xl font-medium text-gray-900 dark:text-white">
                Outreach Programme
              </p>
            </div>
          </NuxtLink>

          <!-- Community Service Card -->
          <NuxtLink
            to="/programs"
            class="group block bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-800 overflow-hidden"
          >
            <div class="aspect-video overflow-hidden">
              <img
                src="/assets/images/light.jpg"
                alt="Community Service"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div class="p-6">
              <span class="text-primary-600 font-semibold text-sm uppercase tracking-wider"
                >Community Service</span
              >
              <p class="mt-2 text-xl font-medium text-gray-900 dark:text-white">
                Trust Replaces 15 Damaged High Tension Electric Poles
              </p>
            </div>
          </NuxtLink>
        </div>

        <div class="mt-12 text-center">
          <UButton to="/programs" variant="outline" size="xl" class="px-12"> View More </UButton>
        </div>
      </UContainer>
    </div>

    <!-- Portals Section (PRD Alignment) -->
    <div class="py-20 bg-gray-50 dark:bg-gray-900">
      <UContainer>
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Access Our Services
          </h2>
          <p class="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Dedicated portals for applicants, contractors, and staff.
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <!-- Applicants -->
          <div
            class="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center"
          >
            <div
              class="w-16 h-16 mx-auto bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-6"
            >
              <UIcon name="i-lucide-graduation-cap" class="w-8 h-8 text-primary-600" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Applicants & Students
            </h3>
            <p class="text-gray-600 dark:text-gray-300 mb-6">
              Apply for scholarships, track your application status, and manage your profile.
            </p>
            <div class="space-y-2">
              <UButton to="/programs" block variant="soft"> Apply Now </UButton>
              <UButton to="/student/dashboard" block variant="outline" color="gray">
                Check Status
              </UButton>
            </div>
          </div>

          <!-- Contractors -->
          <div
            class="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center"
          >
            <div
              class="w-16 h-16 mx-auto bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-6"
            >
              <UIcon name="i-lucide-briefcase" class="w-8 h-8 text-orange-600" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Contractors</h3>
            <p class="text-gray-600 dark:text-gray-300 mb-6">
              View open contracts, submit bids, and manage your contractor profile.
            </p>
            <UButton to="/contracts" block variant="soft" color="orange"> View Contracts </UButton>
          </div>

          <!-- Staff -->
          <div
            class="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center"
          >
            <div
              class="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6"
            >
              <UIcon name="i-lucide-shield-check" class="w-8 h-8 text-blue-600" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Staff & Admin</h3>
            <p class="text-gray-600 dark:text-gray-300 mb-6">
              Access administrative tools for finance, HR, and support operations.
            </p>
            <UButton to="/auth/login" block variant="soft" color="blue"> Staff Login </UButton>
          </div>
        </div>
      </UContainer>
    </div>

    <!-- Join CTA Section -->
    <div class="relative h-[500px] bg-gray-900">
      <div class="absolute inset-0">
        <img
          src="/assets/images/section4-i.png"
          alt="Join us"
          class="w-full h-full object-cover opacity-40"
        />
      </div>
      <div class="relative h-full flex items-center justify-center text-center px-4">
        <div class="max-w-3xl space-y-8">
          <p class="text-4xl md:text-5xl font-bold text-white leading-tight">
            Join hands with us to create a<br />
            better life and beautiful<br />future.
          </p>
          <UButton
            to="/auth/signup"
            size="xl"
            color="primary"
            class="rounded-tl-none rounded-br-none rounded-tr-3xl rounded-bl-3xl px-12"
          >
            Join Us
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>
