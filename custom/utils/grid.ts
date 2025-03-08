export class GridData {
  public rows: number;
  public columns: number;
  public cellSize: number;
  public backScale: number;
  public userMap!: Record<string, any>;
  public priorityGrid!: number[][];
  public zones!: any[];
  public invalidationArray!: any[];
  public userCount!: number;
  
  private random: any;
  
  constructor() {
    this.rows = 22;
    this.columns = 196;
    this.cellSize = 10;
    this.backScale = 0.4;
    this.random = {
      integer: (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min,
      float: (min: number, max: number) => Math.random() * (max - min) + min
    };
    this.defaultInvalidation();
    this.clear();
  }
  
  defaultInvalidation(): void {
    this.invalidationArray = [];
  }
  
  clear(): void {
    this.zones = [];
    this.priorityGrid = [];
    
    // Initialize priority grid
    for (let i = 0; i < this.rows; ++i) {
      const row: number[] = [];
      for (let j = 0; j < this.columns; ++j) {
        row.push(100);
      }
      this.priorityGrid.push(row);
    }
    
    this.userCount = 0;
    this.userMap = {};
    
    // Define audience zones (numbering is from back to front)
    this.addZone(1, { x: 0, y: 0, w: this.columns, h: this.rows - 12 });             // Back zone (furthest from DJ)
    this.addZone(2, { x: 0, y: this.rows - 12, w: this.columns, h: 6 });             // Middle zone
    this.addZone(3, { x: 0, y: this.rows - 5, w: this.columns, h: 3 });              // Front zone (close to DJ)
    this.addZone(4, { x: this.columns * (3 / 8), y: this.rows - 4, w: this.columns / 4, h: 2 }); // VIP area
    this.addZone(5, { x: Math.floor(this.columns / 2) - 7, y: this.rows - 1, w: 1, h: 1 });     // Current user spot
    this.addZone(6, { x: 70, y: this.rows - 5, w: this.columns - 140, h: 4 });      // Special avatars zone
    
    // Apply easing to make perspective look better
    for (let i = 0; i < this.rows; ++i) {
      // Calculate width adjustment for perspective
      const t = Math.floor(this.quadEaseOut(i, 0, 1 - this.backScale, this.rows) * this.columns / 2);
      const availableWidth = this.columns - 2 * t - 4;
      
      // Apply priority values
      for (let j = 0; j < availableWidth; ++j) {
        let priority;
        if (j < availableWidth / 2) {
          priority = this.quadEaseOut(j, 50, 50, availableWidth / 2);
        } else {
          priority = this.quadEaseIn(j - availableWidth / 2, 100, -50, availableWidth / 2);
        }
        this.setCellPriority(i, j + t + 2, priority);
      }
      
      // Invalidate side areas to prevent avatars from appearing there
      this.invalidateCellsInBounds({ x: 0, y: i, w: 2 + t, h: 1 });
      this.invalidateCellsInBounds({ x: this.columns - t - 2, y: i, w: 2 + t, h: 1 });
    }
    
    // Invalidate bottom row areas
    this.invalidateCellsInBounds({ x: 0, y: this.rows - 1, w: Math.floor(this.columns / 2) - 7, h: 1 });
    this.invalidateCellsInBounds({ x: Math.floor(this.columns / 2) - 5, y: this.rows - 1, w: 5 + Math.floor(this.columns / 2), h: 1 });
    
    // Apply any additional invalidations
    this.invalidateRoomElements();
  }
  
  invalidateRoomElements(): void {
    for (let i = this.invalidationArray.length; i--;) {
      this.invalidateCellsInBounds(this.invalidationArray[i]);
    }
  }
  
  addZone(id: number, bounds: { x: number, y: number, w: number, h: number }): void {
    this.zones.push({ id, bounds });
  }
  
  // Add a user to the grid, returns true if successful, false if grid is full, -1 if user already exists
  addUser(user: any): boolean | number {
    // Check if user already exists
    if (this.userMap[user.id]) {
      return -1;
    }
    
    // Check user cap
    const USER_CAP = 150; // Default cap, could be made configurable
    if (this.userCount < USER_CAP) {
      // Determine zone based on user properties
      let zone = this.getZone(user);
      let cells: { r: number, c: number }[] = [];
      
      // Find cells in zone, going from higher zones to lower if necessary
      if (zone < 6) {
        while ((cells = this.getCellsInZone(zone--)).length === 0 && zone > 0) {}
        
        if (cells.length === 0) {
          // Try again from zone 4 as fallback
          for (zone = 4; (cells = this.getCellsInZone(zone--)).length === 0 && zone > 0;) {}
          
          if (cells.length === 0) {
            return false; // No available cells
          }
        }
      } else if ((cells = this.getCellsInZone(zone)).length === 0) {
        return -1; // No cells in special zone
      }
      
      // Get position for user
      const position = this.getPosition(cells);
      user._position = position;
      
      // Add user to map
      this.userMap[user.id] = user;
      ++this.userCount;
      
      // Invalidate cell and surrounding area to prevent others from being too close
      this.invalidateCellAt(position.r, position.c);
      for (let n = 1; n <= 4; ++n) {
        this.decrementCellsInBounds({
          x: position.c - n,
          y: position.r - 2 * n,
          w: 2 * n + 1,
          h: 3 * n
        });
      }
      
      return true;
    }
    
    return false; // Grid is full
  }
  
  // Get the highest priority user
  getHighestPriority(): { id: string, priority: number } {
    let highestId: string = '';
    let highestPriority = -1;
    
    for (const id in this.userMap) {
      const user = this.userMap[id];
      if (user && user.priority > highestPriority) {
        highestPriority = user.priority;
        highestId = id;
      }
    }
    
    return { id: highestId || '', priority: highestPriority };
  }
  
  // Get position for a user based on cells with highest priority
  getPosition(cells: { r: number, c: number }[]): { r: number, c: number } {
    const highPriorityCells: { r: number, c: number }[] = [];
    const mediumPriorityCells: { r: number, c: number }[] = [];
    const lowPriorityCells: { r: number, c: number }[] = [];
    
    // Sort cells by priority
    for (let i = cells.length; i--;) {
      const priority = this.getPriorityLevelForCellAt(cells[i].r, cells[i].c);
      if (priority > 69) {
        highPriorityCells.push(cells[i]);
      } else if (priority > 49) {
        mediumPriorityCells.push(cells[i]);
      } else if (priority > 24) {
        lowPriorityCells.push(cells[i]);
      }
    }
    
    // Return a random cell based on priority
    if (highPriorityCells.length > 0) {
      return highPriorityCells[this.random.integer(0, highPriorityCells.length - 1)];
    } else if (mediumPriorityCells.length > 0) {
      return mediumPriorityCells[this.random.integer(0, mediumPriorityCells.length - 1)];
    } else if (lowPriorityCells.length > 0) {
      return lowPriorityCells[this.random.integer(0, lowPriorityCells.length - 1)];
    } else {
      return cells[this.random.integer(0, cells.length - 1)];
    }
  }
  
  // Remove a user from the grid
  removeUser(userId: string): boolean {
    if (this.userMap[userId]) {
      const user = this.userMap[userId];
      const position = user._position;
      
      if (position) {
        // Validate cell and surrounding area
        this.validateCellAt(position.r, position.c);
        for (let n = 1; n <= 4; ++n) {
          this.incrementCellsInBounds({
            x: position.c - n,
            y: position.r - 2 * n,
            w: 2 * n + 1,
            h: 3 * n
          });
        }
      }
      
      // Remove user from map
      delete this.userMap[userId];
      --this.userCount;
      
      return true;
    }
    
    return false;
  }
  
  // Determine zone for a user based on their properties
  getZone(user: any): number {
    // Check if it's the current user
    if (user.isCurrentUser) {
      return 5;
    }
    
    // Check for special avatars
    if (user.avatarId?.includes('dragon') || user.avatarId?.includes('-e01')) {
      return 6;
    }
    
    // Check for staff/VIP (using role if available)
    if (user.role === 'bouncer' || user.role === 'manager' || user.isFriend) {
      return 4;
    }
    
    // Check for DJs
    if (user.role === 'dj') {
      return 3;
    }
    
    // Random placement based on level
    const random = this.random.float(0, 1);
    const level = user.level || 1;
    
    if (level < 3) {
      return random > 0.75 ? 2 : 1;
    } else if (level < 5) {
      if (random > 0.95) return 3;
      else if (random > 0.65) return 2;
      else return 1;
    } else if (level < 7) {
      if (random > 0.7) return 3;
      else if (random > 0.5) return 2;
      else return 1;
    } else if (level < 9) {
      if (random > 0.55) return 3;
      else if (random > 0.35) return 2;
      else return 1;
    } else if (level < 11) {
      if (random > 0.4) return 3;
      else if (random > 0.2) return 2;
      else return 1;
    } else {
      return random > 0.3 ? 3 : 2;
    }
  }
  
  // Get all zone IDs for a cell
  getZoneIDsForCellAt(row: number, col: number): number[] {
    const zoneIds: number[] = [];
    
    for (let i = 0; i < this.zones.length; ++i) {
      const zone = this.zones[i];
      if (
        col >= zone.bounds.x && 
        col <= zone.bounds.x + zone.bounds.w && 
        row >= zone.bounds.y && 
        row <= zone.bounds.y + zone.bounds.h
      ) {
        zoneIds.push(zone.id);
      }
    }
    
    return zoneIds;
  }
  
  // Get all cells in a zone
  getCellsInZone(zoneId: number, includeInvalid: boolean = false): { r: number, c: number }[] {
    const cells: { r: number, c: number }[] = [];
    
    for (let i = 0; i < this.zones.length; ++i) {
      const zone = this.zones[i];
      if (zone.id === zoneId) {
        for (let row = zone.bounds.y; row < zone.bounds.y + zone.bounds.h; ++row) {
          for (let col = zone.bounds.x; col < zone.bounds.x + zone.bounds.w; ++col) {
            if (this.getPriorityLevelForCellAt(row, col) > 0 || includeInvalid) {
              cells.push({ r: row, c: col });
            }
          }
        }
        break;
      }
    }
    
    // Special handling for zone 5 (current user)
    if (zoneId === 5 && cells.length === 0 && !includeInvalid) {
      return this.getCellsInZone(zoneId, true);
    }
    
    return cells;
  }
  
  // Get priority level for a cell
  getPriorityLevelForCellAt(row: number, col: number): number {
    // Ensure row and col are within bounds
    if (row < 0 || row >= this.rows || col < 0 || col >= this.columns) {
      return 0;
    }
    return Math.max(0, this.priorityGrid[row][col]);
  }
  
  // Invalidate a cell (make it unusable)
  invalidateCellAt(row: number, col: number): void {
    if (row >= 0 && row < this.rows && col >= 0 && col < this.columns) {
      this.priorityGrid[row][col] -= 100;
    }
  }
  
  // Validate a cell (make it usable again)
  validateCellAt(row: number, col: number): void {
    if (row >= 0 && row < this.rows && col >= 0 && col < this.columns) {
      this.priorityGrid[row][col] += 100;
    }
  }
  
  // Invalidate all cells in a bounding box
  invalidateCellsInBounds(bounds: { x: number, y: number, w: number, h: number }): void {
    for (let row = bounds.y; row < bounds.y + bounds.h; ++row) {
      if (row < 0 || row >= this.rows) continue;
      
      for (let col = bounds.x; col < bounds.x + bounds.w; ++col) {
        if (col < 0 || col >= this.columns) continue;
        
        this.invalidateCellAt(row, col);
      }
    }
  }
  
  // Decrement priority for cells in a bounding box
  decrementCellsInBounds(bounds: { x: number, y: number, w: number, h: number }): void {
    for (let row = bounds.y; row < bounds.y + bounds.h; ++row) {
      if (row < 0 || row >= this.rows) continue;
      
      for (let col = bounds.x; col < bounds.x + bounds.w; ++col) {
        if (col < 0 || col >= this.columns) continue;
        
        this.decrementCellAt(row, col);
      }
    }
  }
  
  // Increment priority for cells in a bounding box
  incrementCellsInBounds(bounds: { x: number, y: number, w: number, h: number }): void {
    for (let row = bounds.y; row < bounds.y + bounds.h; ++row) {
      if (row < 0 || row >= this.rows) continue;
      
      for (let col = bounds.x; col < bounds.x + bounds.w; ++col) {
        if (col < 0 || col >= this.columns) continue;
        
        this.incrementCellAt(row, col);
      }
    }
  }
  
  // Decrement cell priority
  decrementCellAt(row: number, col: number): void {
    if (row >= 0 && row < this.rows && col >= 0 && col < this.columns) {
      const zoneIds = this.getZoneIDsForCellAt(row, col).sort();
      if (zoneIds.length > 0) {
        this.priorityGrid[row][col] -= this.getAdjustment(zoneIds[zoneIds.length - 1]);
      }
    }
  }
  
  // Increment cell priority
  incrementCellAt(row: number, col: number): void {
    if (row >= 0 && row < this.rows && col >= 0 && col < this.columns) {
      const zoneIds = this.getZoneIDsForCellAt(row, col).sort();
      if (zoneIds.length > 0) {
        this.priorityGrid[row][col] += this.getAdjustment(zoneIds[zoneIds.length - 1]);
      }
    }
  }
  
  // Set cell priority directly
  setCellPriority(row: number, col: number, priority: number): void {
    if (row >= 0 && row < this.rows && col >= 0 && col < this.columns) {
      this.priorityGrid[row][col] = priority;
    }
  }
  
  // Get adjustment amount based on zone
  getAdjustment(zoneId: number): number {
    if (zoneId === 5 || zoneId === 4) {
      return 45;
    } else if (zoneId === 3) {
      return 30;
    } else if (zoneId === 2) {
      return 25;
    } else {
      return 15;
    }
  }
  
  // Helper method: Quadratic easing out
  quadEaseOut(t: number, b: number, c: number, d: number): number {
    t /= d;
    return -c * t * (t - 2) + b;
  }
  
  // Helper method: Quadratic easing in
  quadEaseIn(t: number, b: number, c: number, d: number): number {
    t /= d;
    return c * t * t + b;
  }
  
  // Set custom invalidation areas (for room elements like tables, etc.)
  setInvalidationAreas(areas: { x: number, y: number, w: number, h: number }[]): void {
    this.invalidationArray = areas;
    this.invalidateRoomElements();
  }
  
  // Resize the grid to a new size
  resize(newColumns: number): void {
    // Store old data
    const oldColumns = this.columns;
    const oldPriorityGrid = [...this.priorityGrid];
    const scaleRatio = newColumns / oldColumns;
    
    // Update columns
    this.columns = newColumns;
    
    // Reset grid
    this.priorityGrid = [];
    for (let i = 0; i < this.rows; ++i) {
      const row: number[] = [];
      for (let j = 0; j < this.columns; ++j) {
        row.push(100);
      }
      this.priorityGrid.push(row);
    }
    
    // Update zones with new scaling
    for (let i = 0; i < this.zones.length; i++) {
      const zone = this.zones[i];
      zone.bounds.x = Math.floor(zone.bounds.x * scaleRatio);
      zone.bounds.w = Math.floor(zone.bounds.w * scaleRatio);
    }
    
    // Reapply priority based on original grid
    for (let i = 0; i < this.rows; ++i) {
      for (let j = 0; j < oldColumns; ++j) {
        const newCol = Math.floor(j * scaleRatio);
        if (newCol < this.columns) {
          // Transfer the priority value, scaled as needed
          const priority = oldPriorityGrid[i][j];
          this.priorityGrid[i][newCol] = priority;
        }
      }
    }
    
    // Reapply perspective easing and invalidations
    for (let i = 0; i < this.rows; ++i) {
      const t = Math.floor(this.quadEaseOut(i, 0, 1 - this.backScale, this.rows) * this.columns / 2);
      const availableWidth = this.columns - 2 * t - 4;
      
      for (let j = 0; j < availableWidth; ++j) {
        let priority;
        if (j < availableWidth / 2) {
          priority = this.quadEaseOut(j, 50, 50, availableWidth / 2);
        } else {
          priority = this.quadEaseIn(j - availableWidth / 2, 100, -50, availableWidth / 2);
        }
        this.setCellPriority(i, j + t + 2, priority);
      }
      
      this.invalidateCellsInBounds({ x: 0, y: i, w: 2 + t, h: 1 });
      this.invalidateCellsInBounds({ x: this.columns - t - 2, y: i, w: 2 + t, h: 1 });
    }
    
    // Invalidate bottom row areas
    this.invalidateCellsInBounds({ x: 0, y: this.rows - 1, w: Math.floor(this.columns / 2) - 7, h: 1 });
    this.invalidateCellsInBounds({ x: Math.floor(this.columns / 2) - 5, y: this.rows - 1, w: 5 + Math.floor(this.columns / 2), h: 1 });
    
    // Reapply invalidation areas
    this.invalidateRoomElements();
    
    // Update user positions
    for (const userId in this.userMap) {
      const user = this.userMap[userId];
      const oldPosition = user._position;
      
      if (oldPosition) {
        // Calculate new column position
        const newCol = Math.floor(oldPosition.c * scaleRatio);
        
        // Temporarily validate the old position
        this.validateCellAt(oldPosition.r, oldPosition.c);
        
        // Assign new position
        user._position = { r: oldPosition.r, c: newCol };
        
        // Invalidate new position
        this.invalidateCellAt(user._position.r, user._position.c);
      }
    }
  }
}

// Create singleton instance
export const gridData = new GridData();