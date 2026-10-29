{{- define "pymentor.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "pymentor.fullname" -}}
{{- if eq .Release.Name .Chart.Name -}}
{{- include "pymentor.name" . -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name (include "pymentor.name" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{- define "pymentor.labels" -}}
app.kubernetes.io/name: {{ include "pymentor.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
helm.sh/chart: {{ printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" }}
{{- end -}}

{{- define "pymentor.selectorLabels" -}}
app.kubernetes.io/name: {{ include "pymentor.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{- define "pymentor.imageReference" -}}
{{- if .digest -}}
{{- printf "%s@%s" .repository .digest -}}
{{- else -}}
{{- printf "%s:%s" .repository .tag -}}
{{- end -}}
{{- end -}}
