package proxy

import (
	"strings"
	"sync"
	"time"
)

// CatalogEntry represents a single audit contract in the catalog.
type CatalogEntry struct {
	ContractKey      string            `json:"contract_key"`
	Track            string            `json:"track"`
	AttackFamily     string            `json:"attack_family"`
	TargetKey        string            `json:"target_key"`
	Label            string            `json:"label"`
	Availability     string            `json:"availability"`
	EvidenceLevel    string            `json:"evidence_level"`
	BestWorkspace    string            `json:"best_workspace"`
	SystemGap        string            `json:"system_gap,omitempty"`
	AdmissionStatus  string            `json:"admission_status,omitempty"`
	ProvenanceStatus string            `json:"provenance_status,omitempty"`
	RiskInterpretation map[string]any  `json:"risk_interpretation,omitempty"`
}

// AttackDefenseRow represents a single attack-defense evaluation result.
type AttackDefenseRow struct {
	Track           string  `json:"track"`
	Attack          string  `json:"attack"`
	Defense         string  `json:"defense"`
	Model           string  `json:"model"`
	AUC             float64 `json:"auc"`
	ASR             float64 `json:"asr"`
	TPRAt1PctFPR    float64 `json:"tpr_at_1pct_fpr"`
	QualityCost     string  `json:"quality_cost,omitempty"`
	EvidenceLevel   string  `json:"evidence_level,omitempty"`
	Note            string  `json:"note,omitempty"`
	Boundary        string  `json:"boundary,omitempty"`
	Source          string  `json:"source,omitempty"`
	ProvenanceStatus string `json:"provenance_status,omitempty"`
	DefenseStage    string  `json:"defense_stage,omitempty"`
}

// AttackDefenseTable is the top-level structure for the attack-defense-table snapshot.
type AttackDefenseTable struct {
	Schema      string              `json:"schema"`
	Dataset     string              `json:"dataset"`
	ModelFamily string              `json:"model_family"`
	UpdatedAt   string              `json:"updated_at"`
	Rows        []AttackDefenseRow  `json:"rows"`
}

// AuditJob represents an audit job in any state.
type AuditJob struct {
	JobID         string         `json:"job_id"`
	Status        string         `json:"status"`
	ContractKey   string         `json:"contract_key"`
	WorkspaceName string         `json:"workspace_name"`
	JobType       string         `json:"job_type"`
	TargetModel   string         `json:"target_model,omitempty"`
	Track         string         `json:"track,omitempty"`
	ProgressPct   *int           `json:"progress_pct,omitempty"`
	Metrics       *JobMetrics    `json:"metrics,omitempty"`
	SummaryNote   string         `json:"summary_note,omitempty"`
	Error         string         `json:"error,omitempty"`
	CreatedAt     string         `json:"created_at"`
	UpdatedAt     string         `json:"updated_at"`
	DemoMode      bool           `json:"demo_mode,omitempty"`
}

// JobMetrics contains computed metrics for a completed job.
type JobMetrics struct {
	AUC  string `json:"auc,omitempty"`
	ASR  string `json:"asr,omitempty"`
	TPR  string `json:"tpr,omitempty"`
}

// DemoJobStore manages in-memory demo jobs with time-based state progression.
type DemoJobStore struct {
	mu   sync.RWMutex
	jobs []*AuditJob
}

// NewDemoJobStore creates a new store pre-populated with demo jobs.
func NewDemoJobStore() *DemoJobStore {
	store := &DemoJobStore{}
	store.seedDemoJobs()
	return store
}

func (ds *DemoJobStore) seedDemoJobs() {
	now := time.Now()
	ds.jobs = []*AuditJob{
		{
			JobID:         "demo-job-001",
			Status:        "completed",
			ContractKey:   "black-box/recon/sd15-ddim",
			WorkspaceName: "recon-runtime-mainline-ddim-public-100-step30",
			JobType:       "attack",
			TargetModel:   "stable-diffusion-v1-4",
			Track:         "black-box",
			ProgressPct:   intPtr(100),
			Metrics:       &JobMetrics{AUC: "0.874", ASR: "0.412", TPR: "0.389"},
			SummaryNote:   "High AUC indicates significant membership leakage",
			CreatedAt:     now.Add(-2 * time.Hour).Format(time.RFC3339),
			UpdatedAt:     now.Add(-1*time.Hour - 30*time.Minute).Format(time.RFC3339),
			DemoMode:      true,
		},
		{
			JobID:         "demo-job-002",
			Status:        "completed",
			ContractKey:   "gray-box/pia/sd15-ddim",
			WorkspaceName: "pia-runtime-mainline-ddim-public-100-step30",
			JobType:       "attack",
			TargetModel:   "stable-diffusion-v1-4",
			Track:         "gray-box",
			ProgressPct:   intPtr(100),
			Metrics:       &JobMetrics{AUC: "0.723", ASR: "0.298", TPR: "0.267"},
			SummaryNote:   "Posterior deviation attack shows moderate leakage",
			CreatedAt:     now.Add(-90 * time.Minute).Format(time.RFC3339),
			UpdatedAt:     now.Add(-60 * time.Minute).Format(time.RFC3339),
			DemoMode:      true,
		},
		{
			JobID:         "demo-job-003",
			Status:        "running",
			ContractKey:   "white-box/gsa/sd15-ddim",
			WorkspaceName: "gsa-runtime-mainline-ddim-public-100-step30",
			JobType:       "attack",
			TargetModel:   "stable-diffusion-v1-4",
			Track:         "white-box",
			ProgressPct:   intPtr(67),
			CreatedAt:     now.Add(-10 * time.Minute).Format(time.RFC3339),
			UpdatedAt:     now.Add(-30 * time.Second).Format(time.RFC3339),
			DemoMode:      true,
		},
		{
			JobID:         "demo-job-004",
			Status:        "running",
			ContractKey:   "black-box/recon/pixelart-v2",
			WorkspaceName: "recon-runtime-pixelart-v2-public-100-step30",
			JobType:       "attack",
			TargetModel:   "pixelart-v2",
			Track:         "black-box",
			ProgressPct:   intPtr(23),
			CreatedAt:     now.Add(-3 * time.Minute).Format(time.RFC3339),
			UpdatedAt:     now.Add(-15 * time.Second).Format(time.RFC3339),
			DemoMode:      true,
		},
		{
			JobID:         "demo-job-005",
			Status:        "failed",
			ContractKey:   "gray-box/pia/photoreal-xl",
			WorkspaceName: "pia-runtime-photoreal-xl-public-100-step30",
			JobType:       "attack",
			TargetModel:   "photoreal-xl",
			Track:         "gray-box",
			Error:         "Runtime timeout: upstream server did not respond within 120s",
			CreatedAt:     now.Add(-45 * time.Minute).Format(time.RFC3339),
			UpdatedAt:     now.Add(-40 * time.Minute).Format(time.RFC3339),
			DemoMode:      true,
		},
		{
			JobID:         "demo-job-006",
			Status:        "cancelled",
			ContractKey:   "white-box/gsa/medmnist-derma-v3",
			WorkspaceName: "gsa-runtime-medmnist-derma-v3-public-100-step30",
			JobType:       "attack",
			TargetModel:   "medmnist-derma-v3",
			Track:         "white-box",
			CreatedAt:     now.Add(-20 * time.Minute).Format(time.RFC3339),
			UpdatedAt:     now.Add(-18 * time.Minute).Format(time.RFC3339),
			DemoMode:      true,
		},
	}
}

// List returns all demo jobs with time-based state progression for running jobs.
func (ds *DemoJobStore) List() []*AuditJob {
	ds.mu.Lock()
	defer ds.mu.Unlock()

	now := time.Now()
	for _, job := range ds.jobs {
		if job.Status == "running" {
			created, err := time.Parse(time.RFC3339, job.CreatedAt)
			if err != nil {
				continue
			}
			elapsed := now.Sub(created)
			if elapsed > 30*time.Second {
				pct := int(elapsed.Seconds()) * 2
				if pct >= 100 {
					pct = 100
					job.Status = "completed"
					job.Metrics = &JobMetrics{AUC: "0.651", ASR: "0.187", TPR: "0.142"}
					job.SummaryNote = "Demo mode: simulated completion"
				}
				job.ProgressPct = &pct
			}
			job.UpdatedAt = now.Format(time.RFC3339)
		}
	}

	result := make([]*AuditJob, len(ds.jobs))
	copy(result, ds.jobs)
	return result
}

// Find returns a single demo job by ID, or nil if not found.
func (ds *DemoJobStore) Find(jobID string) *AuditJob {
	ds.mu.RLock()
	defer ds.mu.RUnlock()

	for _, job := range ds.jobs {
		if job.JobID == jobID {
			// Return a copy
			copy := *job
			return &copy
		}
	}
	return nil
}

// Create adds a new demo job to the store.
func (ds *DemoJobStore) Create(contractKey, workspaceName, jobType string) *AuditJob {
	ds.mu.Lock()
	defer ds.mu.Unlock()

	now := time.Now()
	jobID := "demo-job-" + now.Format("20060102-150405")

	// Infer model from contract key
	model := inferModelFromContract(contractKey)
	track := inferTrackFromContract(contractKey)

	job := &AuditJob{
		JobID:         jobID,
		Status:        "queued",
		ContractKey:   contractKey,
		WorkspaceName: workspaceName,
		JobType:       jobType,
		TargetModel:   model,
		Track:         track,
		CreatedAt:     now.Format(time.RFC3339),
		UpdatedAt:     now.Format(time.RFC3339),
		DemoMode:      true,
	}

	ds.jobs = append(ds.jobs, job)
	result := *job
	return &result
}

// Cancel marks a demo job as cancelled.
func (ds *DemoJobStore) Cancel(jobID string) *AuditJob {
	ds.mu.Lock()
	defer ds.mu.Unlock()

	for _, job := range ds.jobs {
		if job.JobID == jobID {
			job.Status = "cancelled"
			job.UpdatedAt = time.Now().Format(time.RFC3339)
			result := *job
			return &result
		}
	}
	return nil
}

func inferModelFromContract(contractKey string) string {
	switch {
	case contains(contractKey, "sd15-ddim"):
		return "stable-diffusion-v1-4"
	case contains(contractKey, "pixelart"):
		return "pixelart-v2"
	case contains(contractKey, "photoreal"):
		return "photoreal-xl"
	case contains(contractKey, "medmnist"):
		return "medmnist-derma-v3"
	case contains(contractKey, "audio-diffusion"):
		return "audio-diffusion-s"
	default:
		return "unknown"
	}
}

func inferTrackFromContract(contractKey string) string {
	switch {
	case contains(contractKey, "black-box") || contains(contractKey, "recon"):
		return "black-box"
	case contains(contractKey, "gray-box") || contains(contractKey, "pia"):
		return "gray-box"
	case contains(contractKey, "white-box") || contains(contractKey, "gsa"):
		return "white-box"
	default:
		return "black-box"
	}
}

func contains(s, substr string) bool {
	return strings.Contains(s, substr)
}

func intPtr(v int) *int {
	return &v
}
