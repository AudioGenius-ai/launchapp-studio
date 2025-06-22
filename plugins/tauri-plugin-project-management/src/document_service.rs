use crate::error::Result;
use crate::models::*;
use crate::storage_manager::StorageManager;
use chrono::Utc;
use std::sync::Arc;
use tauri::AppHandle;

pub struct DocumentService {
    storage: Arc<StorageManager>,
}

impl DocumentService {
    pub fn new(app_handle: AppHandle) -> Self {
        Self {
            storage: Arc::new(StorageManager::new(app_handle)),
        }
    }

    pub async fn create_document(&self, project_id: &str, request: CreateDocumentRequest) -> Result<Document> {
        let _project = self.storage.load_project(project_id).await?;

        let document = Document::new(
            project_id.to_string(),
            request.title,
            request.content,
            request.template,
            _project.owner,
            request.permissions,
        );

        self.storage.save_document(&document).await?;

        Ok(document)
    }

    pub async fn get_document(&self, project_id: &str, document_id: &str) -> Result<Document> {
        self.storage.load_document(project_id, document_id).await
    }

    pub async fn update_document(&self, project_id: &str, document_id: &str, request: UpdateDocumentRequest) -> Result<Document> {
        let mut document = self.storage.load_document(project_id, document_id).await?;

        if let Some(title) = request.title {
            document.title = title;
        }
        if let Some(content) = request.content {
            document.content = content;
        }
        if let Some(tags) = request.tags {
            document.tags = tags;
        }
        if let Some(status) = request.status {
            document.status = status;
        }
        if let Some(permissions) = request.permissions {
            document.permissions = permissions;
        }

        document.updated_at = Utc::now();

        self.storage.save_document(&document).await?;

        Ok(document)
    }

    pub async fn delete_document(&self, project_id: &str, document_id: &str) -> Result<bool> {
        self.storage.delete_document(project_id, document_id).await?;
        Ok(true)
    }

    pub async fn list_documents(&self, project_id: &str, filter: Option<DocumentFilter>) -> Result<Vec<Document>> {
        let mut documents = self.storage.list_documents(project_id).await?;

        if let Some(filter) = filter {
            documents = self.apply_document_filters(documents, filter);
        }

        Ok(documents)
    }

    pub async fn search_documents(&self, project_id: &str, query: &str) -> Result<Vec<Document>> {
        self.storage.search_documents(project_id, query).await
    }

    pub async fn render_document(&self, project_id: &str, document_id: &str) -> Result<String> {
        let document = self.storage.load_document(project_id, document_id).await?;
        
        let options = comrak::ComrakOptions::default();
        let html = comrak::markdown_to_html(&document.content, &options);
        
        Ok(html)
    }

    pub async fn get_document_templates(&self) -> Result<Vec<DocumentTemplate>> {
        Ok(vec![
            DocumentTemplate::Page,
            DocumentTemplate::Blog,
            DocumentTemplate::Requirements,
            DocumentTemplate::ApiDoc,
            DocumentTemplate::Meeting,
            DocumentTemplate::Troubleshooting,
            DocumentTemplate::UserGuide,
            DocumentTemplate::TechnicalSpec,
        ])
    }

    pub async fn get_document_history(&self, _project_id: &str, _document_id: &str) -> Result<Vec<DocumentVersion>> {
        // TODO: Implement version history tracking
        Ok(Vec::new())
    }

    pub async fn create_document_from_template(&self, project_id: &str, template: DocumentTemplate, title: String) -> Result<Document> {
        let template_content = self.get_template_content(&template);
        
        let request = CreateDocumentRequest {
            title,
            content: template_content,
            template,
            tags: Vec::new(),
            parent_id: None,
            permissions: DocumentPermissions {
                read: Vec::new(),
                write: Vec::new(),
                admin: Vec::new(),
            },
        };

        self.create_document(project_id, request).await
    }

    pub async fn export_document(&self, project_id: &str, document_id: &str, format: &str) -> Result<Vec<u8>> {
        let document = self.storage.load_document(project_id, document_id).await?;
        
        match format {
            "html" => {
                let html = self.render_document(project_id, document_id).await?;
                Ok(html.into_bytes())
            }
            "md" => {
                Ok(document.content.into_bytes())
            }
            _ => Err(crate::error::ProjectManagementError::ValidationError {
                field: "format".to_string(),
                message: "Unsupported export format".to_string(),
            })
        }
    }

    fn apply_document_filters(&self, mut documents: Vec<Document>, filter: DocumentFilter) -> Vec<Document> {
        if let Some(status_filter) = filter.status {
            documents.retain(|d| status_filter.contains(&d.status));
        }
        if let Some(template_filter) = filter.template {
            documents.retain(|d| template_filter.contains(&d.template));
        }
        if let Some(author_filter) = filter.author {
            documents.retain(|d| author_filter.contains(&d.author));
        }
        if let Some(tags_filter) = filter.tags {
            documents.retain(|d| d.tags.iter().any(|tag| tags_filter.contains(tag)));
        }
        if let Some(parent_id) = filter.parent_id {
            documents.retain(|d| d.parent_id.as_ref() == Some(&parent_id));
        }
        documents
    }

    fn get_template_content(&self, template: &DocumentTemplate) -> String {
        match template {
            DocumentTemplate::Page => {
                "# Page Title\n\nYour content here...\n\n## Section 1\n\nAdd your content.\n\n## Section 2\n\nAdd more content.".to_string()
            }
            DocumentTemplate::Blog => {
                "# Blog Post Title\n\n**Published:** [Date]\n**Author:** [Author Name]\n\n## Introduction\n\nWrite your introduction here...\n\n## Main Content\n\nYour blog post content...\n\n## Conclusion\n\nWrap up your thoughts...".to_string()
            }
            DocumentTemplate::Requirements => {
                "# Requirements Document\n\n## Overview\n\nBrief description of the requirements.\n\n## Functional Requirements\n\n### REQ-001: Requirement Title\n**Description:** Detailed requirement description\n**Priority:** High/Medium/Low\n**Acceptance Criteria:**\n- [ ] Criteria 1\n- [ ] Criteria 2\n\n## Non-Functional Requirements\n\n### Performance Requirements\n\n### Security Requirements\n\n### Usability Requirements".to_string()
            }
            DocumentTemplate::ApiDoc => {
                "# API Documentation\n\n## Overview\n\nAPI description and purpose.\n\n## Authentication\n\nDescribe authentication method.\n\n## Endpoints\n\n### GET /api/resource\n\n**Description:** Endpoint description\n\n**Parameters:**\n- `param1` (string): Parameter description\n\n**Response:**\n```json\n{\n  \"data\": \"example\"\n}\n```\n\n**Status Codes:**\n- 200: Success\n- 400: Bad Request\n- 401: Unauthorized".to_string()
            }
            DocumentTemplate::Meeting => {
                "# Meeting Notes\n\n**Date:** [Date]\n**Time:** [Time]\n**Attendees:** [List of attendees]\n\n## Agenda\n\n1. Item 1\n2. Item 2\n3. Item 3\n\n## Discussion\n\n### Topic 1\n\nNotes on discussion...\n\n### Topic 2\n\nNotes on discussion...\n\n## Action Items\n\n- [ ] Action item 1 (Assigned to: [Person])\n- [ ] Action item 2 (Assigned to: [Person])\n\n## Next Meeting\n\n**Date:** [Date]\n**Time:** [Time]".to_string()
            }
            DocumentTemplate::Troubleshooting => {
                "# Troubleshooting Guide\n\n## Issue Description\n\nDescribe the problem or issue.\n\n## Symptoms\n\n- Symptom 1\n- Symptom 2\n- Symptom 3\n\n## Root Cause Analysis\n\nExplain the root cause of the issue.\n\n## Solution\n\n### Step 1\nDetailed instructions...\n\n### Step 2\nDetailed instructions...\n\n### Step 3\nDetailed instructions...\n\n## Prevention\n\nHow to prevent this issue in the future.\n\n## Related Issues\n\nLinks to related problems or documentation.".to_string()
            }
            DocumentTemplate::UserGuide => {
                "# User Guide\n\n## Getting Started\n\nIntroduction to the feature or system.\n\n## Prerequisites\n\n- Requirement 1\n- Requirement 2\n\n## Step-by-Step Instructions\n\n### Step 1: Initial Setup\n\n1. First action\n2. Second action\n3. Third action\n\n### Step 2: Configuration\n\n1. Configuration step 1\n2. Configuration step 2\n\n### Step 3: Usage\n\n1. Usage instruction 1\n2. Usage instruction 2\n\n## Troubleshooting\n\n### Common Issues\n\n**Issue 1:** Description\n**Solution:** How to fix it\n\n**Issue 2:** Description\n**Solution:** How to fix it\n\n## Additional Resources\n\n- [Link 1](url)\n- [Link 2](url)".to_string()
            }
            DocumentTemplate::TechnicalSpec => {
                "# Technical Specification\n\n## Overview\n\nHigh-level description of the technical solution.\n\n## Architecture\n\n### System Components\n\n- Component 1: Description\n- Component 2: Description\n- Component 3: Description\n\n### Data Flow\n\nDescribe how data flows through the system.\n\n## Technical Requirements\n\n### Performance Requirements\n\n- Requirement 1\n- Requirement 2\n\n### Security Requirements\n\n- Security measure 1\n- Security measure 2\n\n## Implementation Details\n\n### Database Schema\n\n```sql\nCREATE TABLE example (\n  id INT PRIMARY KEY,\n  name VARCHAR(255)\n);\n```\n\n### API Specifications\n\nDetailed API documentation.\n\n## Testing Strategy\n\n### Unit Tests\n\n### Integration Tests\n\n### Performance Tests\n\n## Deployment\n\n### Environment Setup\n\n### Deployment Steps\n\n## Monitoring and Maintenance\n\n### Monitoring Requirements\n\n### Maintenance Procedures".to_string()
            }
        }
    }
}