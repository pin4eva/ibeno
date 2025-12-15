<script setup lang="ts">
const BOTImg = [
  { name: 'Barr. Inyang Akpanika', position: '', img: '/assets/images/pic-5.png' },
  { name: 'Engr. Samuel Ekpenyong', position: 'Chairman', img: '/assets/images/pic-4.png' },
  { name: 'Engr. Inyang Okon- Itrechio', position: '.', img: '/assets/images/pic-6.png' }
]

const Monaco = [
  { name: 'Engr James Utiaruk', position: 'Cordinator', img: '/assets/images/pic-5.png' }
]

const Advisory = [
  { name: 'Elder Solomon Ukochio', position: 'Coordinator, HCAD', img: '/assets/images/pic-5.png' },
  { name: 'Monday Williams', position: ' Secretary, HCAD.', img: '/assets/images/pic-6.png' }
]
</script>

<template>
  <div>
    <!-- Hero / Mission -->
    <div class="relative py-24 bg-[url('/assets/images/Frame.png')] bg-cover bg-center">
      <div class="absolute inset-0 bg-white/80 dark:bg-gray-900/80" />
      <UContainer class="relative z-10">
        <div class="max-w-3xl mx-auto text-center">
          <h1 class="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-6">
            OUR MISSION
          </h1>
          <p class="text-xl leading-relaxed text-gray-800 dark:text-gray-100">
            To ensure that Trust funds are managed and utilized responsibly, and channeled into
            sustainable infrastructural and developmental projects to benefit all communities in
            Ibeno LGA.
          </p>
        </div>
      </UContainer>
    </div>

    <!-- Who We Are -->
    <div class="py-16 bg-white dark:bg-gray-900">
      <UContainer>
        <h2 class="text-3xl font-bold text-center text-primary-600 dark:text-primary-400 mb-8">
          WHO WE ARE
        </h2>
        <div class="max-w-4xl mx-auto text-lg leading-relaxed text-gray-600 dark:text-gray-300 space-y-4">
          <p>
            <strong class="text-primary-600 dark:text-primary-400">Ibeno Host Community Development Trust
              (IHCDT)</strong>
            is a non-profit development organization which aims to play a crucial role in improving
            the lives of the people/communities within Ibeno Local Government Area of Akwa Ibom State.
          </p>
          <p>
            IHCDT aims to address a wide range of development issues and concerns, from eradicating
            poverty; to advancing educational development, providing excellence healthcare and
            infrastructure projects. We are the backbone of the community and a fundamental pillar;
            providing essential support for local initiatives to protect the environment and enhance
            security. We offer mentorship, leadership training and recreational activities. We foster
            community ownership by ensuring communities participate in opportunities for their
            benefits.
          </p>
        </div>
      </UContainer>
    </div>

    <!-- Our Visions -->
    <div class="py-16 bg-primary-50 dark:bg-gray-800">
      <UContainer>
        <h2 class="text-3xl font-bold text-center text-primary-600 dark:text-primary-400 mb-12">
          OUR VISIONS
        </h2>
        <div class="grid md:grid-cols-2 gap-12 items-center">
          <div class="space-y-8">
            <div>
              <h3 class="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">
                Vision for the TRUST
              </h3>
              <p class="text-lg text-gray-600 dark:text-gray-300">
                To be the catalyst for the accelerated socioeconomic and developmental growth of
                Ibeno communities through infrastructure and sustainable projects/programmes.
              </p>
            </div>
            <div>
              <h3 class="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">
                Vision for Ibeno Communities
              </h3>
              <p class="text-lg text-gray-600 dark:text-gray-300">
                To make Ibeno a flourishing community where all its sections of Ibeno community
                achieve economic growth, access opportunities and attain their potentials.
              </p>
            </div>
          </div>
          <div class="relative flex justify-center items-center h-80">
            <!-- Recreating the image layout with absolute positioning or flex -->
            <div class="relative w-full h-full flex justify-center items-center">
              <img src="/assets/images/img-3.png"
                class="w-24 h-24 rounded-full absolute top-0 right-10 md:right-20 object-cover shadow-lg"
                alt="Vision 3">
              <img src="/assets/images/img-1.png"
                class="w-64 h-64 rounded-full z-10 object-cover shadow-xl border-4 border-white dark:border-gray-700"
                alt="Vision 1">
              <img src="/assets/images/img-2.png"
                class="w-32 h-32 rounded-full absolute bottom-0 left-10 md:left-20 object-cover shadow-lg"
                alt="Vision 2">
            </div>
          </div>
        </div>
      </UContainer>
    </div>

    <!-- Aims & Objectives -->
    <div class="py-16 bg-white dark:bg-gray-900">
      <UContainer>
        <h2 class="text-3xl font-bold text-center text-primary-600 dark:text-primary-400 mb-8">
          AIMS & OBJECTIVES
        </h2>
        <UCard class="max-w-3xl mx-auto">
          <p class="text-lg font-semibold mb-4">
            Our aim and objectives include:
          </p>
          <ul class="list-disc pl-6 space-y-3 text-gray-600 dark:text-gray-300">
            <li>Addressing the multifaceted development challenges faced by Ibeno communities.</li>
            <li>Working towards improving the overall quality of life for the people of Ibeno local government area.
            </li>
            <li>Improving the socio-economic and environmental conditions of our communities, working with the Settlers
              as a major partner, to build a vibrant and thriving community.</li>
          </ul>
        </UCard>
      </UContainer>
    </div>

    <!-- Core Values -->
    <div class="py-16 bg-gray-50 dark:bg-gray-800">
      <UContainer>
        <h2 class="text-3xl font-bold text-center text-primary-600 dark:text-primary-400 mb-8">
          OUR CORE VALUES
        </h2>
        <UCard class="max-w-3xl mx-auto">
          <p class="mb-6 text-gray-600 dark:text-gray-300">
            Underpinning the vision and mission, are a number of core values that inform how the
            Trust works and how it relates to others. These values and principles form the core
            foundation of the Trust, making it more than a contractual organization.
          </p>
          <ul class="space-y-4 text-gray-600 dark:text-gray-300">
            <li><strong class="text-gray-900 dark:text-white">Integrity</strong></li>
            <li><strong class="text-gray-900 dark:text-white">Transparency</strong></li>
            <li>
              <strong class="text-gray-900 dark:text-white">Partnership</strong><br>
              With the external Investors/businesses and the communities. Development of partnerships, working with
              these businesses and the communities within Ibeno where appropriate and relevant.
            </li>
            <li>
              <strong class="text-gray-900 dark:text-white">Innovative and Strategic</strong><br>
              We believe it often takes innovative and strategic thinking and action to find the imaginative solutions
              that help create lasting and positive change.
            </li>
            <li>
              <strong class="text-gray-900 dark:text-white">Community Ownership</strong><br>
              We appreciate the importance of hearing the views, hopes, fears and aspirations of the communities in
              Ibeno and reflecting them as best as possible in the operation of the Trust.
            </li>
            <li>
              <strong class="text-gray-900 dark:text-white">Safety</strong><br>
              Safety is, for us, a way of life and we will make Safety a foremost consideration in all the operations of
              the Trust.
            </li>
          </ul>
        </UCard>
      </UContainer>
    </div>

    <!-- Meet Our Team -->
    <div class="py-16 bg-white dark:bg-gray-900">
      <UContainer>
        <h2 class="text-3xl font-bold text-center text-primary-600 dark:text-primary-400 mb-16">
          MEET OUR TEAM
        </h2>

        <!-- BoT -->
        <div class="grid lg:grid-cols-2 gap-12 mb-20 items-center">
          <div class="space-y-4">
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
              <span class="border-b-4 border-primary-500">Board of Trustees</span> (BoT)
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              In compliance with the Act, the IHCDT, Board of Trustees, was inaugurated in July 2023. The Settler, Mobil
              Producing Nigeria Unlimited had presented the certificate of incorporation to members of the Trust.
            </p>
            <p class="text-gray-600 dark:text-gray-300">
              The Board of Trustees, BoT, is chaired by Engr. Samuel Ekpenyong. Other members; Barr. Inyang Akpanika,
              Engr. Inyang Okon- Itrechio, and Mrs. Gloria Ukochio.
            </p>
            <p class="text-gray-600 dark:text-gray-300">
              The BoT is made up of persons who are of high integrity and professional standing, encouraging diversity
              and inclusion based on various factors including disability, age and gender.
            </p>
          </div>
          <div class="grid grid-cols-3 gap-4">
            <div v-for="bot in BOTImg" :key="bot.name" class="text-center">
              <img :src="bot.img" class="w-32 h-32 mx-auto rounded-full object-cover mb-3 shadow-md" :alt="bot.name">
              <h4 class="font-semibold text-primary-600 dark:text-primary-400 text-sm">
                {{ bot.name }}
              </h4>
              <p class="text-xs text-gray-500">
                {{ bot.position }}
              </p>
            </div>
          </div>
        </div>

        <!-- MANCO -->
        <div class="grid lg:grid-cols-2 gap-12 mb-20 items-center">
          <div class="lg:order-2 space-y-4 text-right">
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
              Management <span class="border-b-4 border-primary-500">Committee</span> (MANCO)
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              The HCMC (Host Committee Management Committee) is part of the governance organ of the HCDT. The HCMC is
              responsible for the general administration of the Trust. The IHCMC was also inaugurated in July 2023.
            </p>
            <p class="text-gray-600 dark:text-gray-300">
              The IHCMC is headed by Engr James Utiaruk, a seasoned Engineer with years of experience.
            </p>
          </div>
          <div class="lg:order-1 flex justify-center">
            <div v-for="member in Monaco" :key="member.name" class="text-center">
              <img :src="member.img" class="w-40 h-40 mx-auto rounded-full object-cover mb-3 shadow-md"
                :alt="member.name">
              <h4 class="font-semibold text-primary-600 dark:text-primary-400">
                {{ member.name }}
              </h4>
              <p class="text-sm text-gray-500">
                {{ member.position }}
              </p>
            </div>
          </div>
        </div>

        <!-- Advisory -->
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <div class="space-y-4">
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
              <span class="border-b-4 border-primary-500">Advisory</span> Committee
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              Another major governance body of the IHCMC is the Advisory Committee. The Advisory Committee among other
              responsibilities advises the HCMC on activities that may lead to improvement of security of infrastructure
              and enhancement of peace-building within the communities and the entire area of operation. The HCAD is
              headed by a Coordinator and a Secretary.
            </p>
          </div>
          <div class="grid grid-cols-2 gap-8">
            <div v-for="member in Advisory" :key="member.name" class="text-center">
              <img :src="member.img" class="w-32 h-32 mx-auto rounded-full object-cover mb-3 shadow-md"
                :alt="member.name">
              <h4 class="font-semibold text-primary-600 dark:text-primary-400 text-sm">
                {{ member.name }}
              </h4>
              <p class="text-xs text-gray-500">
                {{ member.position }}
              </p>
            </div>
          </div>
        </div>
      </UContainer>
    </div>
  </div>
</template>
