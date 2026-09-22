const roomsGrid = document.getElementById("roomsGrid");
const roomModal = document.getElementById("roomModal");
const modalClose = document.getElementById("modalClose");
const modalImage = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const modalDescription = document.getElementById("modalDescription");
const modalAmenities = document.getElementById("modalAmenities");
const modalInfo = document.getElementById("modalInfo");
const modalPrice = document.getElementById("modalPrice");
const modalReserve = document.getElementById("modalReserve");
const modalCapacity = document.getElementById("modalCapacity");

const roomSearch = document.getElementById("roomSearch");
const roomTypeFilter = document.getElementById("roomTypeFilter");
const guestFilter = document.getElementById("guestFilter");
const sortRooms = document.getElementById("sortRooms");
const resetFiltersBtn = document.getElementById("resetFilters");
const clearRoomFiltersBtn = document.getElementById("clearRoomFilters");
const roomCount = document.getElementById("roomCount");
const activeFilters = document.getElementById("activeFilters");
const noRooms = document.getElementById("noRooms");

let rooms = [];
let filteredRooms = [];

function peso(value) {
  return (
    "₱" +
    Number(value || 0).toLocaleString("en-PH", {
      maximumFractionDigits: 0,
    })
  );
}

function normalizeAmenities(amenities) {
  if (Array.isArray(amenities)) return amenities;
  if (typeof amenities === "string") {
    try {
      const parsed = JSON.parse(amenities);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      return amenities
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }
  return [];
}

function getRoomTypeValue(room) {
  const type = String(room.type || room.room_type || room.category || "")
    .toLowerCase()
    .trim();
  const name = String(room.name || "").toLowerCase();

  if (type.includes("villa") || name.includes("villa")) return "villa";
  if (type.includes("family") || name.includes("family")) return "family";
  if (type.includes("suite") || name.includes("suite")) return "suite";
  if (type.includes("room") || name.includes("room")) return "room";
  return type || "room";
}

function updateRoomCount(count) {
  if (!roomCount) return;
  roomCount.textContent =
    count === 1 ? "1 room available" : `${count} rooms available`;
}

function updateActiveFilters() {
  if (!activeFilters) return;

  const tags = [];
  const search = (roomSearch?.value || "").trim();
  const type = roomTypeFilter?.value || "all";
  const guests = guestFilter?.value || "all";
  const sort = sortRooms?.value || "default";

  if (search) tags.push(`Search: "${search}"`);
  if (type !== "all") tags.push(`Type: ${type}`);
  if (guests !== "all") tags.push(`${guests}+ guests`);
  if (sort !== "default") {
    const sortLabel =
      {
        "price-low": "Price: Low to High",
        "price-high": "Price: High to Low",
        name: "Name",
      }[sort] || sort;
    tags.push(`Sort: ${sortLabel}`);
  }

  if (tags.length === 0) {
    activeFilters.innerHTML = `
      <span class="filter-label">Showing:</span>
      <span class="filter-tag">All Rooms</span>
    `;
    return;
  }

  activeFilters.innerHTML = `
    <span class="filter-label">Showing:</span>
    ${tags.map((tag) => `<span class="filter-tag">${tag}</span>`).join("")}
  `;
}

function applyFilters() {
  const search = (roomSearch?.value || "").trim().toLowerCase();
  const type = roomTypeFilter?.value || "all";
  const guests = guestFilter?.value || "all";
  const sort = sortRooms?.value || "default";

  filteredRooms = rooms.filter((room) => {
    const name = String(room.name || "").toLowerCase();
    const description = String(room.description || "").toLowerCase();
    const roomType = getRoomTypeValue(room);
    const maxGuests = Number(room.max_guests || room.capacity || 0);

    const matchesSearch =
      !search || name.includes(search) || description.includes(search);

    const matchesType = type === "all" || roomType === type;

    const matchesGuests = guests === "all" || maxGuests >= Number(guests);

    return matchesSearch && matchesType && matchesGuests;
  });

  if (sort === "price-low") {
    filteredRooms.sort((a, b) => Number(a.price) - Number(b.price));
  } else if (sort === "price-high") {
    filteredRooms.sort((a, b) => Number(b.price) - Number(a.price));
  } else if (sort === "name") {
    filteredRooms.sort((a, b) =>
      String(a.name || "").localeCompare(String(b.name || "")),
    );
  }

  updateRoomCount(filteredRooms.length);
  updateActiveFilters();
  renderRooms();
}

function renderRooms() {
  if (!roomsGrid) return;

  if (!filteredRooms.length) {
    roomsGrid.innerHTML = "";
    if (noRooms) noRooms.style.display = "block";
    return;
  }

  if (noRooms) noRooms.style.display = "none";

  roomsGrid.innerHTML = filteredRooms
    .map((room) => {
      const image = room.image_url || room.image || "";
      const name = room.name || "Room";
      const description = room.description || "";
      const id = room.id;

      return `
        <article class="room-card">
          <img src="${image}" alt="${name}">
          <div class="room-card-body">
            <h3>${name}</h3>
            <p>${description}</p>
            <div class="price">${peso(room.price)} / night</div>
            <button class="btn btn-primary details-btn" data-id="${id}">
              View Details
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  document.querySelectorAll(".details-btn").forEach((button) => {
    button.addEventListener("click", () => {
      openRoom(Number(button.dataset.id));
    });
  });
}

function openRoom(id) {
  const room = rooms.find((item) => Number(item.id) === id);
  if (!room || !roomModal) return;

  const amenities = normalizeAmenities(room.amenities);
  const maxGuests = room.max_guests || room.capacity || "—";
  const beds = room.beds || "—";
  const size = room.size || "—";
  const view = room.view || "—";

  if (modalImage) {
    modalImage.src = room.image_url || room.image || "";
    modalImage.alt = room.name || "Room";
  }

  if (modalTitle) modalTitle.textContent = room.name || "Room";
  if (modalDescription) {
    modalDescription.textContent = room.description || "";
  }

  if (modalInfo) {
    modalInfo.textContent = `${maxGuests} guests • ${beds} • ${size} • ${view}`;
  }

  if (modalCapacity) {
    modalCapacity.textContent = maxGuests === "—" ? "—" : `${maxGuests} guests`;
  }

  if (modalPrice) {
    modalPrice.textContent = `${peso(room.price)} / night`;
  }

  if (modalAmenities) {
    modalAmenities.innerHTML = amenities.length
      ? amenities.map((item) => `<span class="amenity">${item}</span>`).join("")
      : `<span class="amenity">No amenities listed</span>`;
  }

  if (modalReserve) {
    const slug = room.slug || room.id;
    modalReserve.href = `./reservation.html?room=${encodeURIComponent(slug)}`;
  }

  roomModal.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeRoom() {
  if (!roomModal) return;
  roomModal.classList.remove("show");
  document.body.style.overflow = "";
}

function resetFilters() {
  if (roomSearch) roomSearch.value = "";
  if (roomTypeFilter) roomTypeFilter.value = "all";
  if (guestFilter) guestFilter.value = "all";
  if (sortRooms) sortRooms.value = "default";
  applyFilters();
}

function bindFilterEvents() {
  if (roomSearch) {
    roomSearch.addEventListener("input", applyFilters);
  }
  if (roomTypeFilter) {
    roomTypeFilter.addEventListener("change", applyFilters);
  }
  if (guestFilter) {
    guestFilter.addEventListener("change", applyFilters);
  }
  if (sortRooms) {
    sortRooms.addEventListener("change", applyFilters);
  }
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener("click", resetFilters);
  }
  if (clearRoomFiltersBtn) {
    clearRoomFiltersBtn.addEventListener("click", resetFilters);
  }
}

function bindModalEvents() {
  if (modalClose) {
    modalClose.addEventListener("click", closeRoom);
  }

  if (roomModal) {
    roomModal.addEventListener("click", (event) => {
      if (event.target === roomModal) closeRoom();
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeRoom();
  });
}

async function loadRooms() {
  if (!roomsGrid) return;

  roomsGrid.innerHTML = `
    <div class="rooms-loading">
      <div class="loading-spinner"></div>
      <p>Loading rooms...</p>
    </div>
  `;

  if (noRooms) noRooms.style.display = "none";

  const { data, error } = await supabaseClient
    .from("rooms")
    .select("*")
    .eq("available", true)
    .order("price", { ascending: true });

  if (error) {
    roomsGrid.innerHTML = `
      <p class="message error">Could not load rooms: ${error.message}</p>
    `;
    updateRoomCount(0);
    return;
  }

  rooms = data || [];
  filteredRooms = [...rooms];

  updateRoomCount(rooms.length);
  updateActiveFilters();
  renderRooms();
}

bindFilterEvents();
bindModalEvents();
loadRooms();
