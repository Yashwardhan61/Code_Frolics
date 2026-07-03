package com.codefrolics.legacytrunk.model;

public enum Role {
    ADMIN,   // Full control: CRUD all content, manage roles, moderate
    MEMBER,  // Standard: CRUD own content, view shared content
    VIEWER   // Read-only: Can browse and view, cannot create/edit/delete
}
