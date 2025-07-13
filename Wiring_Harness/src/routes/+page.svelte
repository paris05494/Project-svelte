<script lang="ts">
	import StatusPanel from '$lib/components/StatusPanel.svelte';
	import ExcelFileSelector from '$lib/components/ExcelFileSelector.svelte';
	import HypertacVisualizer from '$lib/components/HypertacVisualizer.svelte';
	import SignalInfoPanel from '$lib/components/SignalInfoPanel.svelte';
</script>

<div class="flex min-h-[calc(100vh-120px)] flex-col p-4 md:grid md:grid-cols-12 md:gap-4">
	<!-- คอลัมน์ซ้าย: สถานะและตัวเลือกไฟล์ Excel -->
	<div class="mb-4 flex flex-col gap-4 md:col-span-3 md:mb-0">
		<!-- แผงสถานะ - ใช้พื้นที่ 1/3 ของความสูงในคอลัมน์นี้ -->
		<div class="h-1/3 min-h-[150px] md:min-h-0">
			<StatusPanel />
		</div>
		<!-- ตัวเลือกไฟล์ Excel - ใช้พื้นที่ 2/3 ของความสูงในคอลัมน์นี้ -->
		<div class="h-2/3 min-h-[300px] md:min-h-0">
			<ExcelFileSelector />
		</div>
	</div>

	<!-- คอลัมน์กลาง: การแสดงผล Hypertac หลัก -->
	<div class="mb-4 md:col-span-6 md:mb-0">
		<HypertacVisualizer />
	</div>

	<!-- คอลัมน์ขวา: ข้อมูลสัญญาณ -->
	<div class="md:col-span-3">
		<SignalInfoPanel />
	</div>
</div>
