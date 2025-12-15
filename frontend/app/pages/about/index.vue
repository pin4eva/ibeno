<script setup lang="ts">
useHead({
  title: 'About - IBENO',
  meta: [
    { name: 'description', content: 'About the IBENO System' }
  ]
})
</script>

<template>
  <div>
    <!-- Hero Section -->
    <div class="relative h-[500px] flex items-center">
      <div class="absolute inset-0">
        <img
          src="/assets/images/beach.jpg"
          alt="Ibeno Beach"
          class="w-full h-full object-cover"
        >
        <div class="absolute inset-0 bg-black/50" />
      </div>

      <UContainer class="relative z-10">
        <div class="max-w-3xl">
          <h1 class="text-5xl md:text-7xl font-extrabold text-white mb-6">
            The People of Ibeno
          </h1>
          <div
            class="inline-block bg-orange-200/10 backdrop-blur-sm border-2 border-orange-200 rounded-tl-2xl rounded-br-2xl p-4"
          >
            <p class="text-xl md:text-3xl font-bold text-orange-200">
              Some Amazing Facts About Ibeno
            </p>
          </div>
        </div>
      </UContainer>
    </div>

    <UContainer class="py-24 space-y-32">
      <!-- Geography Section -->
      <div class="space-y-12">
        <h2 class="text-4xl font-semibold text-center text-primary-600 dark:text-primary-400 uppercase tracking-wide">
          Ibeno Geography
        </h2>

        <div class="grid lg:grid-cols-2 gap-12 items-start">
          <div class="space-y-6 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
            <p>
              <span class="font-bold text-primary-600 dark:text-primary-400">IBENO</span> is located in the south-south
              region of Nigeria. It is a Local Government Area of Akwa Ibom State. Ibeno lies on the eastern side of the
              Qua Iboe River about 3 kilometres from the river mouth, and is one of the largest fishing settlements on
              the Nigerian coast, occupying a vast coastal area of over 1,200 km².
            </p>
            <p>
              Ibeno lies in the Mangrove Forest Belt, bounded to the west by Eastern Obolo Local Government Area, to the
              north by ONNA, Esit Eket and Eket, and to the south by the Atlantic Ocean. Ibeno occupies the largest
              Atlantic coastline, more than 129 km, in Akwa Ibom State.
            </p>
            <p>
              The climatic condition is favourable with rain throughout the year which peaks between May and September
              and suitable for all year round for fishing and farming.
            </p>
          </div>

          <div class="space-y-4">
            <div
              class="aspect-video w-full rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d103577.09466112613!2d7.9491227945791145!3d4.569043155105032!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1067c685d1c241d5%3A0x861216a69ccba388!2sIbeno%2C%20Akwa%20Ibom!5e0!3m2!1sen!2sng!4v1734017797429!5m2!1sen!2sng"
                width="100%"
                height="100%"
                style="border:0;"
                allowfullscreen="true"
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
              />
            </div>
            <p class="text-center text-sm text-gray-500 italic">
              Bird's eye view map of Ibeno
            </p>
          </div>
        </div>
      </div>

      <!-- Roots Section -->
      <div class="space-y-12">
        <h2 class="text-4xl font-semibold text-center text-primary-600 dark:text-primary-400 uppercase tracking-wide">
          Our Roots
        </h2>

        <div class="max-w-3xl mx-auto text-center text-lg leading-relaxed text-gray-600 dark:text-gray-300">
          <p>
            Ibeno is an ancient coastal community consisting of over 26 gazetted villages. The people of Ibeno are
            believed to have migrated from the hinterlands before settling by the Atlantic Ocean. Over time, the sea has
            become central to their way of life. Notably, Ibeno played a crucial role in the spread of Christianity in
            Nigeria, with missionaries arriving in the 19th century. Their arrival transformed the spiritual and
            cultural fabric of the community.
          </p>
        </div>
      </div>

      <!-- Culture Section -->
      <div class="grid lg:grid-cols-2 gap-16 items-center">
        <div class="order-2 lg:order-1">
          <div class="relative">
            <img
              src="/assets/images/dresss-play.jpg"
              alt="Ibeno Attire"
              class="rounded-tl-3xl rounded-br-3xl shadow-xl w-full h-auto"
            >
            <p class="text-center text-sm text-gray-500 italic mt-4">
              Beautiful Ibeno attire
            </p>
          </div>
        </div>
        <div
          class="order-1 lg:order-2 space-y-6 text-lg leading-relaxed text-gray-600 dark:text-gray-300 lg:text-right"
        >
          <h3 class="text-3xl font-medium text-gray-900 dark:text-white">
            Vibrant <span class="text-primary-600 border-b-4 border-primary-600">Culture</span>
          </h3>
          <p>
            Ibeno's culture is deeply connected to the sea. Festivals, traditional dances, and art are at the heart of
            community life. The "Akata Ibeno" is a beautiful display of Ibeno's heritage and is performed during
            communal celebrations. Colorful attire, music, and masquerades add vibrancy to festivals, while traditional
            storytelling keeps the community's history alive.
          </p>
        </div>
      </div>

      <!-- Economy Section -->
      <div class="grid lg:grid-cols-2 gap-16 items-center">
        <div class="space-y-6 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
          <h3 class="text-3xl font-medium text-gray-900 dark:text-white">
            <span class="text-primary-600 border-b-4 border-primary-600">Economic Opportunities</span> in Ibeno
          </h3>
          <p>
            Ibeno's economy thrives due to its coastal location. The community is one of the major hubs for Nigeria's
            oil and gas industry, with multinational companies providing job opportunities. Fishing remains an integral
            part of life, with both artisanal and commercial fishing contributing to trade and food security. There is
            also potential for agricultural growth, with cassava, yams, and plantains commonly cultivated.
          </p>
        </div>
        <div>
          <div class="relative">
            <img
              src="/assets/images/market.jpeg"
              alt="Ibeno Market"
              class="rounded-tr-3xl rounded-bl-3xl shadow-xl w-full h-auto"
            >
            <p class="text-center text-sm text-gray-500 italic mt-4">
              Ibeno local market
            </p>
          </div>
        </div>
      </div>

      <!-- Occupations Section -->
      <div class="grid lg:grid-cols-2 gap-16 items-center">
        <div class="order-2 lg:order-1">
          <div class="relative">
            <img
              src="/assets/images/fishing.jpg"
              alt="Fishing Activities"
              class="rounded-tl-3xl rounded-br-3xl shadow-xl w-full h-auto"
            >
            <p class="text-center text-sm text-gray-500 italic mt-4">
              Fishermen carrying out fishing activities
            </p>
          </div>
        </div>
        <div
          class="order-1 lg:order-2 space-y-6 text-lg leading-relaxed text-gray-600 dark:text-gray-300 lg:text-right"
        >
          <h3 class="text-3xl font-medium text-gray-900 dark:text-white">
            Traditional <span class="text-primary-600 border-b-4 border-primary-600">Occupations</span>
          </h3>
          <p>
            Ibeno's proximity to the Atlantic Ocean has made fishing the dominant occupation for generations. Families
            engage in artisanal fishing, while others run larger commercial operations harvesting several sea foods.
            Farming is also common, with locals growing cassava, yams, and plantains. With the discovery of oil, many in
            Ibeno have found employment in the petroleum sector.
          </p>
        </div>
      </div>

      <!-- Natural Resources Section -->
      <div class="grid lg:grid-cols-2 gap-16 items-center">
        <div class="space-y-6 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
          <h3 class="text-3xl font-medium text-gray-900 dark:text-white">
            <span class="text-primary-600 border-b-4 border-primary-600">Natural</span> Resources
          </h3>
          <p>
            Ibeno is rich in natural resources, particularly oil and gas. The region is a key player in Nigeria's oil
            production, hosting several multinational companies. This has created jobs and spurred economic growth in
            the area. Beyond oil, Ibeno's coastal and marine resources are vital to both local and national economies.
          </p>
        </div>
        <div>
          <div class="relative">
            <img
              src="/assets/images/oil-workers.jpg"
              alt="Oil Workers"
              class="rounded-tr-3xl rounded-bl-3xl shadow-xl w-full h-auto"
            >
            <p class="text-center text-sm text-gray-500 italic mt-4">
              Rig workers in action
            </p>
          </div>
        </div>
      </div>

      <!-- Tourism Section -->
      <div class="grid lg:grid-cols-2 gap-16 items-center">
        <div class="order-2 lg:order-1">
          <div class="relative">
            <img
              src="/assets/images/ibeno-bich.jpg"
              alt="Ibeno Beach"
              class="rounded-tl-3xl rounded-br-3xl shadow-xl w-full h-auto"
            >
            <p class="text-center text-sm text-gray-500 italic mt-4">
              A plan-view of Ibeno beach
            </p>
          </div>
        </div>
        <div
          class="order-1 lg:order-2 space-y-6 text-lg leading-relaxed text-gray-600 dark:text-gray-300 lg:text-right"
        >
          <h3 class="text-3xl font-medium text-gray-900 dark:text-white">
            A Hidden <span class="text-primary-600 border-b-4 border-primary-600">Tourism Gem</span>
          </h3>
          <p>
            Ibeno Beach is one of the longest and most beautiful beaches in West Africa, drawing visitors for
            relaxation, water sports, and cultural festivals. Its pristine stretch of coastline offers a peaceful escape
            and is perfect for eco-tourism. The area is also home to rich marine life and wetlands, making it ideal for
            nature lovers and adventurers.
          </p>
        </div>
      </div>
    </UContainer>
  </div>
</template>
