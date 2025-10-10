// Paternal Family Tree JavaScript
document.addEventListener("DOMContentLoaded", () => {
  // Firebase references
  const auth = firebase.auth();
  const db = firebase.database();
  const storage = firebase.storage();
  
  // UI Elements
  const menuBtn = document.getElementById("menuBtn");
  const sideMenu = document.getElementById("sideMenu");
  const menuOverlay = document.getElementById("menuOverlay");
  const addMemberBtn = document.getElementById("addMemberBtn");
  const expandAllBtn = document.getElementById("expandAllBtn");
  const collapseAllBtn = document.getElementById("collapseAllBtn");
  const startTreeBtn = document.getElementById("startTreeBtn");
  const loadingTree = document.getElementById("loadingTree");
  const emptyTree = document.getElementById("emptyTree");
  const familyTree = document.getElementById("familyTree");
  const memberModal = document.getElementById("memberModal");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const memberForm = document.getElementById("memberForm");
  const detailsModal = document.getElementById("detailsModal");
  const logoutBtn = document.getElementById("logoutBtn");
  
  // Form elements
  const modalTitle = document.getElementById("modalTitle");
  const memberId = document.getElementById("memberId");
  const memberName = document.getElementById("memberName");
  const birthDate = document.getElementById("birthDate");
  const deathDate = document.getElementById("deathDate");
  const birthPlace = document.getElementById("birthPlace");
  const relationship = document.getElementById("relationship");
  const relativeToGroup = document.getElementById("relativeToGroup");
  const relativeTo = document.getElementById("relativeTo");
  const memberPhoto = document.getElementById("memberPhoto");
  const photoPreview = document.getElementById("photoPreview");
  const memberBio = document.getElementById("memberBio");
  const deleteBtn = document.getElementById("deleteBtn");
  
  let currentUser = null;
  let currentUserSafeEmail = null;
  let treeData = null;
  let familyMembers = [];
  let selectedMember = null;
  let photoToUpload = null;
  
  /* === UI Handlers === */
  
  // Sidebar Toggle
  function openSidebar() {
    sideMenu.classList.add("active");
    menuOverlay.classList.add("active");
    sideMenu.setAttribute("aria-hidden", "false");
  }
  
  function closeSidebar() {
    sideMenu.classList.remove("active");
    menuOverlay.classList.remove("active");
    sideMenu.setAttribute("aria-hidden", "true");
  }

  menuBtn?.addEventListener("click", () => {
    if (sideMenu.classList.contains("active")) closeSidebar();
    else openSidebar();
  });
  
  menuOverlay?.addEventListener("click", closeSidebar);
  
  // Open Add Member Modal
  addMemberBtn?.addEventListener("click", () => {
    openAddMemberModal();
  });
  
  startTreeBtn?.addEventListener("click", () => {
    openAddMemberModal(true);
  });
  
  // Close modal
  closeModalBtn?.addEventListener("click", () => {
    memberModal.classList.add("hidden");
  });
  
  detailsModal.querySelector(".close-details")?.addEventListener("click", () => {
    detailsModal.classList.add("hidden");
  });
  
  // Expand/Collapse All
  expandAllBtn?.addEventListener("click", () => {
    document.querySelectorAll(".tree-node.collapsed").forEach(node => {
      toggleNodeCollapse(node, false);
    });
  });
  
  collapseAllBtn?.addEventListener("click", () => {
    document.querySelectorAll(".tree-node:not(.collapsed)").forEach(node => {
      if (node.querySelector(".tree-level")) {
        toggleNodeCollapse(node, true);
      }
    });
  });
  
  // Photo upload preview
  memberPhoto?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.match('image.*')) {
      showToast("Please select an image file", "error");
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      showToast("Image is too large (max 5MB)", "error");
      return;
    }
    
    photoToUpload = file;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      photoPreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
      photoPreview.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
  });
  
  // Relationship selection change
  relationship?.addEventListener("change", () => {
    const value = relationship.value;
    if (value === "self") {
      relativeToGroup.classList.add("hidden");
    } else {
      relativeToGroup.classList.remove("hidden");
      populateRelativesDropdown();
    }
  });
  
  // Form submission
  memberForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    saveMember();
  });
  
  // Delete member button
  deleteBtn?.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete this family member? This will also remove any descendants.")) {
      deleteMember();
    }
  });
  
  /* === Family Tree Functions === */
  
  // Open add member modal
  function openAddMemberModal(isFirst = false) {
    modalTitle.textContent = "Add Family Member";
    memberForm.reset();
    memberId.value = "";
    photoPreview.innerHTML = "";
    photoPreview.classList.add("hidden");
    photoToUpload = null;
    deleteBtn.classList.add("hidden");
    
    if (isFirst) {
      // First member is always self
      relationship.value = "self";
      relativeToGroup.classList.add("hidden");
    } else {
      relationship.value = "";
      populateRelativesDropdown();
    }
    
    memberModal.classList.remove("hidden");
  }
  
  // Open edit member modal
  function openEditMemberModal(member) {
    modalTitle.textContent = "Edit Family Member";
    memberId.value = member.id;
    memberName.value = member.name || "";
    birthDate.value = member.birthDate || "";
    deathDate.value = member.deathDate || "";
    birthPlace.value = member.birthPlace || "";
    relationship.value = member.relationship || "";
    memberBio.value = member.bio || "";
    deleteBtn.classList.remove("hidden");
    
    if (member.photoURL) {
      photoPreview.innerHTML = `<img src="${member.photoURL}" alt="${member.name}">`;
      photoPreview.classList.remove("hidden");
    } else {
      photoPreview.innerHTML = "";
      photoPreview.classList.add("hidden");
    }
    
    photoToUpload = null;
    
    if (member.relationship === "self") {
      relativeToGroup.classList.add("hidden");
    } else {
      relativeToGroup.classList.remove("hidden");
      populateRelativesDropdown();
      relativeTo.value = member.relativeTo || "";
    }
    
    memberModal.classList.remove("hidden");
  }
  
  // Populate relatives dropdown
  function populateRelativesDropdown() {
    relativeTo.innerHTML = '<option value="">Select Relative</option>';
    
    familyMembers.forEach(member => {
      const option = document.createElement("option");
      option.value = member.id;
      option.textContent = member.name;
      relativeTo.appendChild(option);
    });
  }
  
  // Save member
  async function saveMember() {
    try {
      const id = memberId.value || generateId();
      const isNew = !memberId.value;
      
      const memberData = {
        id,
        name: memberName.value.trim(),
        birthDate: birthDate.value || null,
        deathDate: deathDate.value || null,
        birthPlace: birthPlace.value.trim() || null,
        relationship: relationship.value,
        relativeTo: relationship.value === "self" ? null : relativeTo.value,
        bio: memberBio.value.trim() || null,
        photoURL: null,
        updatedAt: Date.now()
      };
      
      // Validate
      if (!memberData.name) {
        showToast("Please enter a name", "error");
        return;
      }
      
      if (memberData.relationship !== "self" && !memberData.relativeTo) {
        showToast("Please select a relative", "error");
        return;
      }
      
      // Upload photo if changed
      if (photoToUpload) {
        const photoURL = await uploadPhoto(photoToUpload, id);
        memberData.photoURL = photoURL;
      } else if (!isNew) {
        // Keep existing photo
        const existingMember = familyMembers.find(m => m.id === id);
        if (existingMember && existingMember.photoURL) {
          memberData.photoURL = existingMember.photoURL;
        }
      }
      
      // Save to Firebase
      await db.ref(`users/${currentUserSafeEmail}/paternalTree/${id}`).set(memberData);
      
      showToast(`Family member ${isNew ? 'added' : 'updated'} successfully`, "success");
      memberModal.classList.add("hidden");
      
      // Reload tree data
      loadFamilyTree();
      
    } catch (error) {
      console.error("Error saving member:", error);
      showToast("Failed to save member. Please try again.", "error");
    }
  }
  
  // Upload photo to Firebase Storage
  async function uploadPhoto(file, memberId) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${memberId}_${Date.now()}.${fileExt}`;
    const storageRef = storage.ref(`users/${currentUserSafeEmail}/paternalTree/${fileName}`);
    
    await storageRef.put(file);
    return await storageRef.getDownloadURL();
  }
  
  // Delete member
  async function deleteMember() {
    try {
      const id = memberId.value;
      if (!id) return;
      
      // Delete from Firebase
      await db.ref(`users/${currentUserSafeEmail}/paternalTree/${id}`).remove();
      
      // Delete descendants
      const descendants = findDescendants(id);
      for (const descendantId of descendants) {
        await db.ref(`users/${currentUserSafeEmail}/paternalTree/${descendantId}`).remove();
      }
      
      showToast("Family member deleted successfully", "success");
      memberModal.classList.add("hidden");
      
      // Reload tree data
      loadFamilyTree();
      
    } catch (error) {
      console.error("Error deleting member:", error);
      showToast("Failed to delete member. Please try again.", "error");
    }
  }
  
  // Find all descendants of a member
  function findDescendants(memberId) {
    const descendants = [];
    
    function findChildren(parentId) {
      familyMembers.forEach(member => {
        if (member.relativeTo === parentId) {
          descendants.push(member.id);
          findChildren(member.id);
        }
      });
    }
    
    findChildren(memberId);
    return descendants;
  }
  
  // Load family tree data
  async function loadFamilyTree() {
    try {
      loadingTree.classList.remove("hidden");
      familyTree.classList.add("hidden");
      emptyTree.classList.add("hidden");
      
      const snapshot = await db.ref(`users/${currentUserSafeEmail}/paternalTree`).once("value");
      const data = snapshot.val() || {};
      
      familyMembers = Object.values(data);
      
      if (familyMembers.length === 0) {
        loadingTree.classList.add("hidden");
        emptyTree.classList.remove("hidden");
        return;
      }
      
      // Build the tree
      buildFamilyTree();
      
      loadingTree.classList.add("hidden");
      familyTree.classList.remove("hidden");
      
    } catch (error) {
      console.error("Error loading family tree:", error);
      loadingTree.classList.add("hidden");
      emptyTree.classList.remove("hidden");
      showToast("Failed to load family tree. Please try again.", "error");
    }
  }
  
  // Build the family tree visualization
  function buildFamilyTree() {
    // Clear previous tree
    familyTree.innerHTML = '';
    
    // Find root (self)
    const root = familyMembers.find(member => member.relationship === "self");
    
    if (!root) {
      emptyTree.classList.remove("hidden");
      return;
    }
    
    // Create ancestors section (going up)
    const ancestors = findAncestors(root.id);
    if (ancestors.length > 0) {
      const ancestorLevels = groupByGenerations(ancestors);
      
      // Render ancestors (oldest first)
      ancestorLevels.reverse().forEach(level => {
        const levelEl = document.createElement("div");
        levelEl.className = "tree-level ancestors";
        
        level.forEach(member => {
          const nodeEl = createNodeElement(member);
          levelEl.appendChild(nodeEl);
        });
        
        familyTree.appendChild(levelEl);
        
        // Add connecting branches
        addBranches(level);
      });
    }
    
    // Create root level (self)
    const rootLevel = document.createElement("div");
    rootLevel.className = "tree-level root";
    const rootNode = createNodeElement(root);
    rootLevel.appendChild(rootNode);
    familyTree.appendChild(rootLevel);
    
    // Create descendants section (going down)
    const descendants = findDescendantsByGeneration(root.id);
    descendants.forEach(level => {
      const levelEl = document.createElement("div");
      levelEl.className = "tree-level descendants";
      
      level.forEach(member => {
        const nodeEl = createNodeElement(member);
        levelEl.appendChild(nodeEl);
      });
      
      familyTree.appendChild(levelEl);
      
      // Add connecting branches
      addBranches(level);
    });
    
    // Start animations
    setTimeout(initTreeAnimations, 500);
  }
  
  // Create a node element
  function createNodeElement(member) {
    const nodeEl = document.createElement("div");
    nodeEl.className = "tree-node";
    nodeEl.dataset.id = member.id;
    
    const contentEl = document.createElement("div");
    contentEl.className = "node-content";
    
    // Photo/avatar
    const photoEl = document.createElement("div");
    photoEl.className = "node-photo";
    if (member.photoURL) {
      photoEl.innerHTML = `<img src="${member.photoURL}" alt="${member.name}">`;
    } else {
      photoEl.innerHTML = '<i class="fas fa-user"></i>';
    }
    contentEl.appendChild(photoEl);
    
    // Name
    const nameEl = document.createElement("h3");
    nameEl.className = "node-name";
    nameEl.textContent = member.name;
    contentEl.appendChild(nameEl);
    
    // Years
    const yearsEl = document.createElement("p");
    yearsEl.className = "node-years";
    
    let yearsText = '';
    if (member.birthDate) {
      const birthYear = new Date(member.birthDate).getFullYear();
      yearsText += birthYear;
    } else {
      yearsText += "?";
    }
    
    yearsText += " - ";
    
    if (member.deathDate) {
      const deathYear = new Date(member.deathDate).getFullYear();
      yearsText += deathYear;
    } else {
      yearsText += member.relationship === "self" ? "Present" : "?";
    }
    
    yearsEl.textContent = yearsText;
    contentEl.appendChild(yearsEl);
    
    // Add children toggle if has children
    const hasChildren = familyMembers.some(m => m.relativeTo === member.id);
    if (hasChildren) {
      const toggleBtn = document.createElement("div");
      toggleBtn.className = "toggle-children";
      toggleBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
      toggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleNodeCollapse(nodeEl);
      });
      contentEl.appendChild(toggleBtn);
    }
    
    // Open member details on click
    contentEl.addEventListener("click", () => {
      openMemberDetails(member);
    });
    
    nodeEl.appendChild(contentEl);
    return nodeEl;
  }
  
  // Find ancestors of a member
  function findAncestors(memberId) {
    const ancestors = [];
    let currentId = memberId;
    
    while (true) {
      const member = familyMembers.find(m => m.id === currentId);
      if (!member || !member.relativeTo) break;
      
      const parent = familyMembers.find(m => m.id === member.relativeTo);
      if (!parent) break;
      
      ancestors.push(parent);
      currentId = parent.id;
    }
    
    return ancestors;
  }
  
  // Group ancestors by generation
  function groupByGenerations(ancestors) {
    const generations = [];
    let currentGeneration = [];
    let currentRelation = null;
    
    ancestors.forEach(member => {
      if (!currentRelation || 
          (currentRelation === "father" && member.relationship === "grandfather") ||
          (currentRelation === "grandfather" && member.relationship === "great-grandfather")) {
        // New generation
        if (currentGeneration.length > 0) {
          generations.push(currentGeneration);
        }
        currentGeneration = [member];
        currentRelation = member.relationship;
      } else {
        // Same generation
        currentGeneration.push(member);
      }
    });
    
    if (currentGeneration.length > 0) {
      generations.push(currentGeneration);
    }
    
    return generations;
  }
  
  // Find descendants by generation
  function findDescendantsByGeneration(memberId) {
    const generations = [];
    
    function findGeneration(parentIds, depth = 0) {
      const children = familyMembers.filter(m => parentIds.includes(m.relativeTo));
      
      if (children.length === 0) return;
      
      if (!generations[depth]) {
        generations[depth] = [];
      }
      
      generations[depth].push(...children);
      
      const childIds = children.map(c => c.id);
      findGeneration(childIds, depth + 1);
    }
    
    findGeneration([memberId]);
    return generations;
  }
  
  // Add branches between tree levels
  function addBranches(levelMembers) {
    levelMembers.forEach(member => {
      if (!member.relativeTo) return;
      
      setTimeout(() => {
        const childNode = document.querySelector(`.tree-node[data-id="${member.id}"]`);
        const parentNode = document.querySelector(`.tree-node[data-id="${member.relativeTo}"]`);
        
        if (!childNode || !parentNode) return;
        
        const childRect = childNode.getBoundingClientRect();
        const parentRect = parentNode.getBoundingClientRect();
        const treeRect = familyTree.getBoundingClientRect();
        
        // Create vertical branch
        const verticalBranch = document.createElement("div");
        verticalBranch.className = "tree-branch vertical-branch branch-animated";
        
        // Calculate positions
        const verticalTop = parentRect.bottom - treeRect.top;
        const verticalHeight = childRect.top - parentRect.bottom;
        const verticalLeft = parentRect.left + parentRect.width / 2 - treeRect.left;
        
        verticalBranch.style.top = `${verticalTop}px`;
        verticalBranch.style.left = `${verticalLeft}px`;
        verticalBranch.style.height = `${verticalHeight}px`;
        
        familyTree.appendChild(verticalBranch);
        
        // Create horizontal branch if child is not directly below parent
        if (Math.abs(childRect.left - parentRect.left) > 10) {
          const horizontalBranch = document.createElement("div");
          horizontalBranch.className = "tree-branch horizontal-branch branch-animated";
          
          // Calculate positions
          const horizontalTop = childRect.top - treeRect.top - 4;
          const horizontalLeft = verticalLeft;
          const horizontalWidth = childRect.left + childRect.width / 2 - horizontalLeft;
          
          horizontalBranch.style.top = `${horizontalTop}px`;
          horizontalBranch.style.left = `${horizontalLeft}px`;
          horizontalBranch.style.width = `${Math.abs(horizontalWidth)}px`;
          
          if (horizontalWidth < 0) {
            horizontalBranch.style.left = `${childRect.left + childRect.width / 2 - treeRect.left}px`;
            horizontalBranch.style.transform = "scaleX(-1)";
          }
          
          familyTree.appendChild(horizontalBranch);
        }
        
        // Add leaves to branches
        addLeaves(verticalBranch);
      }, 100);
    });
  }
  
  // Add leaves to branches for decoration
  function addLeaves(branch) {
    const count = Math.floor(Math.random() * 3) + 1; // 1-3 leaves
    
    for (let i = 0; i < count; i++) {
      const leaf = document.createElement("div");
      leaf.className = "tree-leaf animated";
      
      // Position leaf randomly along the branch
      const position = 20 + Math.random() * 60; // 20%-80% of branch length
      const offset = -5 + Math.random() * 10; // -5px to 5px from center
      
      if (branch.classList.contains("vertical-branch")) {
        leaf.style.top = `${position}%`;
        leaf.style.left = `${offset}px`;
      } else {
        leaf.style.left = `${position}%`;
        leaf.style.top = `${offset}px`;
      }
      
      // Add slight random rotation
      const rotation = -15 + Math.random() * 30; // -15° to 15°
      leaf.style.transform = `rotate(${45 + rotation}deg)`;
      
      branch.appendChild(leaf);
    }
  }
  
  // Toggle node collapse
  function toggleNodeCollapse(node, collapse) {
    const isCollapsed = node.classList.contains("collapsed");
    const newState = collapse !== undefined ? collapse : !isCollapsed;
    
    if (newState) {
      node.classList.add("collapsed");
    } else {
      node.classList.remove("collapsed");
    }
    
    // Find and toggle visibility of child nodes and branches
    const memberId = node.dataset.id;
    const children = familyMembers.filter(m => m.relativeTo === memberId);
    
    children.forEach(child => {
      const childNode = document.querySelector(`.tree-node[data-id="${child.id}"]`);
      if (childNode) {
        const childLevel = childNode.closest(".tree-level");
        
        if (newState) {
          childLevel.style.display = "none";
          
          // Also hide all descendants
          const allDescendants = findDescendants(child.id);
          allDescendants.forEach(descendantId => {
            const descendantNode = document.querySelector(`.tree-node[data-id="${descendantId}"]`);
            if (descendantNode) {
              const descendantLevel = descendantNode.closest(".tree-level");
              descendantLevel.style.display = "none";
            }
          });
        } else {
          childLevel.style.display = "";
          
          // Check if child was previously collapsed
          if (!childNode.classList.contains("collapsed")) {
            // Show immediate children of this child
            const grandchildren = familyMembers.filter(m => m.relativeTo === child.id);
            grandchildren.forEach(grandchild => {
              const grandchildNode = document.querySelector(`.tree-node[data-id="${grandchild.id}"]`);
              if (grandchildNode) {
                grandchildNode.closest(".tree-level").style.display = "";
              }
            });
          }
        }
      }
    });
  }
  
  // Initialize tree animations
  function initTreeAnimations() {
    // Vary animation timing for branches
    document.querySelectorAll(".branch-animated").forEach((branch, index) => {
      const delay = (index % 3) * 0.5; // 0, 0.5, 1 seconds
      branch.style.animationDelay = `${delay}s`;
      
      // Vary animation duration slightly
      const duration = 7 + Math.random() * 3; // 7-10 seconds
      branch.style.animationDuration = `${duration}s`;
    });
    
    // Vary animation timing for leaves
    document.querySelectorAll(".tree-leaf").forEach((leaf, index) => {
      const delay = Math.random() * 2; // 0-2 seconds
      leaf.style.animationDelay = `${delay}s`;
      
      // Vary animation duration slightly
      const duration = 6 + Math.random() * 4; // 6-10 seconds
      leaf.style.animationDuration = `${duration}s`;
    });
  }
  
  // Open member details
  function openMemberDetails(member) {
    selectedMember = member;
    
    // Populate details
    document.getElementById("detailName").textContent = member.name;
    
    // Birth/Death
    const birthEl = document.getElementById("detailBirth");
    const deathEl = document.getElementById("detailDeath");
    
    if (member.birthDate) {
      const birthDate = new Date(member.birthDate);
      birthEl.textContent = `Born: ${birthDate.toLocaleDateString()}`;
    } else {
      birthEl.textContent = "Born: Unknown";
    }
    
    if (member.deathDate) {
      const deathDate = new Date(member.deathDate);
      deathEl.textContent = `Died: ${deathDate.toLocaleDateString()}`;
      deathEl.classList.remove("hidden");
    } else {
      deathEl.classList.add("hidden");
    }
    
    // Place
    document.getElementById("detailPlace").textContent = member.birthPlace || "Unknown location";
    
    // Bio
    document.getElementById("detailBio").textContent = member.bio || "No information available.";
    
    // Photo
    const photoEl = document.querySelector(".member-photo");
    if (member.photoURL) {
      photoEl.innerHTML = `<img src="${member.photoURL}" alt="${member.name}">`;
    } else {
      photoEl.innerHTML = '<div class="photo-placeholder"><i class="fas fa-user"></i></div>';
    }
    
    // Relations
    const relationsEl = document.getElementById("detailRelations");
    relationsEl.innerHTML = "";
    
    // Find relations
    let relations = [];
    
    // Parent
    if (member.relativeTo) {
      const parent = familyMembers.find(m => m.id === member.relativeTo);
      if (parent) {
        relations.push({
          name: parent.name,
          relation: member.relationship === "self" ? "Father" : 
                   getRelationName(member.relationship, parent.relationship),
          icon: "fa-user-tie"
        });
      }
    }
    
    // Children
    const children = familyMembers.filter(m => m.relativeTo === member.id);
    children.forEach(child => {
      relations.push({
        name: child.name,
        relation: getRelationName("parent", child.relationship),
        icon: "fa-child"
      });
    });
    
    // Siblings
    if (member.relativeTo) {
      const siblings = familyMembers.filter(m => 
        m.relativeTo === member.relativeTo && m.id !== member.id
      );
      siblings.forEach(sibling => {
        relations.push({
          name: sibling.name,
          relation: "Sibling",
          icon: "fa-user-friends"
        });
      });
    }
    
    // Display relations
    if (relations.length > 0) {
      relations.forEach(relation => {
        const li = document.createElement("li");
        li.innerHTML = `<i class="fas ${relation.icon}"></i> <span><strong>${relation.name}</strong> - ${relation.relation}</span>`;
        relationsEl.appendChild(li);
      });
    } else {
      const li = document.createElement("li");
      li.textContent = "No family relations found";
      relationsEl.appendChild(li);
    }
    
    // Set up buttons
    document.getElementById("editMemberBtn").onclick = () => {
      detailsModal.classList.add("hidden");
      openEditMemberModal(member);
    };
    
    document.getElementById("addChildBtn").onclick = () => {
      detailsModal.classList.add("hidden");
      openAddChildModal(member);
    };
    
    // Show modal
    detailsModal.classList.remove("hidden");
  }
  
  // Open add child modal
  function openAddChildModal(parent) {
    modalTitle.textContent = "Add Child";
    memberForm.reset();
    memberId.value = "";
    photoPreview.innerHTML = "";
    photoPreview.classList.add("hidden");
    photoToUpload = null;
    deleteBtn.classList.add("hidden");
    
    // Set relationship based on parent's gender
    if (parent.relationship === "self" || 
        parent.relationship === "father" || 
        parent.relationship === "grandfather" || 
        parent.relationship === "great-grandfather") {
      relationship.value = "son";
    } else {
      relationship.value = "daughter";
    }
    
    relativeTo.value = parent.id;
    relativeToGroup.classList.remove("hidden");
    
    memberModal.classList.remove("hidden");
  }
  
  // Get relation name
  function getRelationName(childRelation, parentRelation) {
    // Child's perspective
    if (childRelation === "self") {
      return "Father";
    } else if (childRelation === "son" || childRelation === "daughter") {
      return "Sibling";
    } else if (childRelation === "grandson" || childRelation === "granddaughter") {
      return "Uncle";
    }
    
    // Parent's perspective
    if (parentRelation === "self" && (childRelation === "brother" || childRelation === "sister")) {
      return "Sibling";
    } else if (childRelation === "son") {
      return "Son";
    } else if (childRelation === "daughter") {
      return "Daughter";
    } else if (childRelation === "grandson") {
      return "Grandson";
    } else if (childRelation === "granddaughter") {
      return "Granddaughter";
    } else if (childRelation === "nephew") {
      return "Nephew";
    } else if (childRelation === "niece") {
      return "Niece";
    } else if (childRelation === "father") {
      return "Father";
    } else if (childRelation === "grandfather") {
      return "Grandfather";
    } else if (childRelation === "great-grandfather") {
      return "Great Grandfather";
    }
    
    return "Relative";
  }
  
  // Toast notification
  function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    let icon = "check-circle";
    if (type === "error") icon = "exclamation-circle";
    if (type === "warning") icon = "exclamation-triangle";
    if (type === "info") icon = "info-circle";
    
    toast.innerHTML = `<i class="fas fa-${icon}"></i> <span>${message}</span>`;
    
    const container = document.getElementById("toastContainer");
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 5000);
  }
  
  // Generate unique ID
  function generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  /* === Firebase Auth Listener === */
  // Show empty state by default until data loads
  loadingTree.classList.remove("hidden");
  familyTree.classList.add("hidden");
  emptyTree.classList.add("hidden");
  
  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = "../login.html";
      return;
    }
    
    // Update loading message to show progress
    const loadingMessage = document.querySelector("#loadingTree p");
    if (loadingMessage) {
      loadingMessage.textContent = "Authentication verified, loading your family data...";
    }
    
    currentUser = user;
    currentUserSafeEmail = user.email.replace(/\./g, "_").replace(/@/g, "_");
    
    // Load family tree
    loadFamilyTree();
    
    // Set up logout button
    logoutBtn?.addEventListener("click", async () => {
      try {
        await auth.signOut();
        window.location.href = "../login.html";
      } catch (error) {
        console.error("Error signing out:", error);
        showToast("Failed to sign out. Please try again.", "error");
      }
    });
  });
});